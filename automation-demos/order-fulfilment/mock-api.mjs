import { createServer } from 'node:http';
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateOrder } from './validate.mjs';
import { base } from './fixtures.mjs';

function fingerprint(request) {
  const { caseId, demoFault, ...business } = request;
  return createHash('sha256').update(JSON.stringify(business)).digest('hex');
}

/** Local, serialized fixture service; its JSON ledger is not a production datastore. */
export async function startMockApi({ stateFile, port = 0 }) {
  const seed = validateOrder({ ...base, orderId: 'DEMO-CONFLICT', caseId: 'seed' });
  let state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : {
    records: { [seed.idempotencyKey]: { fingerprint: fingerprint(seed.request), labelId: 'SYNTHETIC-PREEXISTING' } },
    purchases: 0, attempts: {}, events: [],
  };
  const persist = () => { writeFileSync(`${stateFile}.tmp`, JSON.stringify(state, null, 2)); renameSync(`${stateFile}.tmp`, stateFile); };
  persist();
  const server = createServer(async (req, res) => {
    const reply = (status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (req.method !== 'POST' || req.url !== '/fulfilments') return reply(404, { error: 'NOT_FOUND' });
    let raw = '';
    for await (const chunk of req) { raw += chunk; if (raw.length > 16000) return reply(413, { error: 'TOO_LARGE' }); }
    let input; try { input = JSON.parse(raw); } catch { return reply(400, { error: 'INVALID_JSON' }); }
    const parsed = validateOrder(input);
    if (!parsed.valid) return reply(400, { error: parsed.reason });
    const key = req.headers['idempotency-key'];
    if (key !== parsed.idempotencyKey) return reply(400, { error: 'KEY_MISMATCH' });
    const request = parsed.request;
    const count = (state.attempts[request.caseId] ?? 0) + 1;
    state.attempts[request.caseId] = count;
    state.events.push({ caseId: request.caseId, key, attempt: count });
    const existing = state.records[key];
    const digest = fingerprint(request);
    if (existing) {
      persist();
      if (existing.fingerprint !== digest) return reply(409, { error: 'IDEMPOTENCY_CONFLICT', caseId: request.caseId });
      return reply(200, { caseId: request.caseId, labelId: existing.labelId, replayed: true, synthetic: true });
    }
    if (request.demoFault === 'permanent' || (request.demoFault === 'transient' && count === 1)) {
      persist(); return reply(503, { error: 'SYNTHETIC_PROVIDER_UNAVAILABLE', caseId: request.caseId });
    }
    const labelId = `SYNTHETIC-LABEL-${++state.purchases}`;
    state.records[key] = { fingerprint: digest, labelId };
    persist(); // Commit before simulating a lost response. Retry must recover this record.
    if (request.demoFault === 'lost-response' && count === 1) { res.destroy(); return; }
    reply(200, { caseId: request.caseId, labelId, replayed: false, synthetic: true });
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return {
    url: `http://127.0.0.1:${server.address().port}/fulfilments`,
    state: () => structuredClone(state),
    close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())),
  };
}
