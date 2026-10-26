import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { startMockApi } from './mock-api.mjs';
import { makeWorkflow } from './build-workflow.mjs';
import { assertResults } from './demo.mjs';

if (Number(process.versions.node.split('.')[0]) < 24) throw new Error('The pinned n8n runtime requires Node.js 24 or newer. The dependency-free demo also supports Node.js 22.');
const dir = mkdtempSync(join(tmpdir(), 'mindrails-n8n-'));
const bin = process.env.N8N_BIN || 'n8n';
const env = {
  PATH: process.env.PATH, HOME: process.env.HOME, ...(process.env.SystemRoot ? { SystemRoot: process.env.SystemRoot } : {}),
  N8N_USER_FOLDER: dir, DB_TYPE: 'sqlite', N8N_DIAGNOSTICS_ENABLED: 'false',
  N8N_VERSION_NOTIFICATIONS_ENABLED: 'false', N8N_TEMPLATES_ENABLED: 'false', N8N_COMMUNITY_PACKAGES_ENABLED: 'false',
  N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS: 'true', N8N_LOG_LEVEL: 'info',
};

async function cli(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error('n8n command exceeded 120 seconds')); }, 120000);
    child.stdout.on('data', c => { out += c; }); child.stderr.on('data', c => { err += c; });
    child.on('error', e => { clearTimeout(timer); reject(e); });
    child.on('close', code => { clearTimeout(timer); code === 0 ? resolve(out) : reject(new Error(`n8n exited ${code}: ${err}\n${out}`)); });
  });
}
function parseOutput(raw) {
  const starts = [...raw.matchAll(/(?:^|\n)\s*(\{)/g)].map(match => match.index + match[0].lastIndexOf('{'));
  for (const start of starts.reverse()) { try { return JSON.parse(raw.slice(start)); } catch { /* try preceding start */ } }
  throw new Error(`No raw execution JSON found: ${raw.slice(-1000)}`);
}

let api;
try {
  const version = (await cli(['--version'])).trim();
  if (version !== '2.44.7') throw new Error(`Expected tested n8n 2.44.7, got ${version}`);
  api = await startMockApi({ stateFile: join(dir, 'ledger.json') });
  const id = `demo${randomBytes(8).toString('hex')}`;
  const workflowFile = join(dir, 'workflow.json');
  writeFileSync(workflowFile, JSON.stringify({ ...makeWorkflow(api.url), id }));
  await cli(['import:workflow', `--input=${workflowFile}`]);
  const reports = [];
  for (let run = 1; run <= 2; run++) {
    const execution = parseOutput(await cli(['execute', `--id=${id}`, '--rawOutput']));
    if (execution.data?.resultData?.error) throw new Error(JSON.stringify(execution.data.resultData.error));
    const data = execution.data?.resultData?.runData;
    if (!data) throw new Error('Execution did not include node results');
    const results = ['Record outcome', 'Rejected before HTTP'].flatMap(name => (data[name] ?? []).flatMap(task => (task.data?.main?.[0] ?? []).map(item => item.json)));
    try { assertResults(results, api.state()); }
    catch (error) {
      console.error(JSON.stringify({ run, results, fixtureState: api.state(), httpNode: data['Create or replay synthetic fulfilment'] }, null, 2));
      throw error;
    }
    const state = api.state();
    assert.equal(state.attempts.permanent, run * 3, 'Permanent failures stop after three attempts per run');
    assert.equal(state.attempts.conflict, run * 3, 'Conflicts have the same bounded demo retry policy');
    assert.equal(state.attempts['lost-response'], run + 1, 'Lost acknowledgement recovers with the original operation key');
    assert.equal(state.attempts.transient, run + 1, 'Transient failure recovers on the second attempt');
    if (run === 2) assert.equal(results.filter(r => r.result === 'fulfilled').every(r => r.replayed === true), true);
    reports.push({ run, results, attemptsCumulative: state.attempts, newSyntheticLabelsTotal: state.purchases });
  }
  const report = { n8nVersion: version, nodeVersion: process.versions.node, checkedAt: new Date().toISOString(), synthetic: true, runs: reports, limits: 'Local fixture HTTP service; no live shop, shipping provider, real labels or customer data.' };
  if (process.env.DEMO_REPORT) writeFileSync(process.env.DEMO_REPORT, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await api?.close(); rmSync(dir, { recursive: true, force: true }); }
