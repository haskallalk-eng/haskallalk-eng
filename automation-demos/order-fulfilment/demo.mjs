import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { fixtures } from './fixtures.mjs';
import { validateOrder } from './validate.mjs';
import { startMockApi } from './mock-api.mjs';

export async function deliver(event, url) {
  const parsed = validateOrder(event);
  if (!parsed.valid) return { caseId: parsed.caseId, result: 'rejected', reason: parsed.reason };
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': parsed.idempotencyKey }, body: JSON.stringify(parsed.request), signal: AbortSignal.timeout(2000) });
      if (!response.ok) continue;
      const result = await response.json();
      if (result.synthetic === true && typeof result.labelId === 'string') return { caseId: parsed.caseId, result: 'fulfilled', labelId: result.labelId, replayed: result.replayed };
    } catch { /* Unknown result: retry the same business operation with the same key. */ }
  }
  return { caseId: parsed.caseId, result: 'manual_review', reason: 'NO_CONFIRMED_FULFILMENT' };
}

export function assertResults(results, state) {
  assert.equal(results.length, fixtures.length);
  for (const fixture of fixtures) assert.equal(results.find(r => r.caseId === fixture.caseId)?.result, fixture.expected, fixture.caseId);
  assert.equal(state.purchases, 3, 'Only three new synthetic labels, regardless of retries/replays');
  assert.equal(state.events.some(event => ['unpaid', 'invalid-address'].includes(event.caseId)), false, 'Rejected orders never reach the fixture API');
  assert.equal(results.find(r => r.caseId === 'happy').labelId, results.find(r => r.caseId === 'duplicate').labelId);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = mkdtempSync(join(tmpdir(), 'mindrails-demo-'));
  let api;
  try {
    api = await startMockApi({ stateFile: join(dir, 'ledger.json') });
    console.log('SYNTHETIC LOCAL HTTP DEMO — Node runner, not the n8n engine. No external services.');
    for (let run = 1; run <= 2; run++) {
      const results = [];
      for (const fixture of fixtures) results.push(await deliver(fixture, api.url));
      assertResults(results, api.state());
      console.log(`\nRun ${run}:`); console.table(results);
      console.log(`New synthetic labels in the persistent demo ledger: ${api.state().purchases}`);
    }
    console.log('\nPASS: 8 cases per run; repeated delivery creates no extra synthetic label.');
  } finally { await api?.close(); rmSync(dir, { recursive: true, force: true }); }
}
