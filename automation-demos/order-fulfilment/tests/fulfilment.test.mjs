import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { base, fixtures } from '../fixtures.mjs';
import { validateOrder } from '../validate.mjs';
import { startMockApi } from '../mock-api.mjs';
import { deliver, assertResults } from '../demo.mjs';
import { makeWorkflow } from '../build-workflow.mjs';

test('unpaid, malformed and invalid money inputs are rejected before transport', () => {
  for (const change of [{ paid: false }, { totalCents: 19.9 }, { totalCents: NaN }, { totalCents: -1 }, { shipmentVersion: 0 }, { tenantId: '../other' }, { items: [] }, { items: [{ sku: 'A', quantity: -1 }] }, { address: null }]) {
    assert.equal(validateOrder({ ...base, caseId: 'invalid', ...change }).valid, false, JSON.stringify(change));
  }
});

test('duplicate SKU lines are rejected instead of silently changing shipment quantities', () => {
  const item = { sku: 'A', quantity: 1 };
  assert.equal(validateOrder({ ...base, caseId: 'invalid', items: [item, item] }).reason, 'DUPLICATE_SKU');
});

test('each imported workflow has inactive manual ingress and bounded retries', () => {
  const workflow = makeWorkflow();
  assert.equal(workflow.active, false);
  const http = workflow.nodes.find(node => node.type === 'n8n-nodes-base.httpRequest');
  assert.equal(http.maxTries, 3);
  assert.equal(workflow.nodes.find(node => node.type === 'n8n-nodes-base.splitInBatches').parameters.batchSize, 1);
  assert.equal(http.parameters.options.timeout, 2000);
  assert.equal(http.parameters.url, 'http://127.0.0.1:8787/fulfilments');
  assert.equal(workflow.nodes.some(node => node.credentials), false);
});

test('all eight scenarios run over actual localhost HTTP and remain idempotent after restart', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'mindrails-test-'));
  const stateFile = join(dir, 'ledger.json');
  let api;
  try {
    api = await startMockApi({ stateFile });
    const first = [];
    for (const event of fixtures) first.push(await deliver(event, api.url));
    assertResults(first, api.state());
    assert.equal(api.state().attempts['lost-response'], 2);
    assert.equal(api.state().attempts.transient, 2);
    assert.equal(api.state().attempts.permanent, 3);
    await api.close(); api = undefined;
    api = await startMockApi({ stateFile });
    const second = [];
    for (const event of fixtures) second.push(await deliver(event, api.url));
    assertResults(second, api.state());
    for (const result of second.filter(r => r.result === 'fulfilled')) assert.equal(result.replayed, true);
  } finally { await api?.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('concurrent duplicate delivery creates exactly one fixture label', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'mindrails-concurrent-'));
  const api = await startMockApi({ stateFile: join(dir, 'ledger.json') });
  try {
    const results = await Promise.all(Array.from({ length: 12 }, (_, i) => deliver({ ...base, caseId: `parallel-${i}` }, api.url)));
    assert.equal(results.every(r => r.result === 'fulfilled'), true);
    assert.equal(new Set(results.map(r => r.labelId)).size, 1);
    assert.equal(api.state().purchases, 1);
  } finally { await api.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('the same order ID in distinct fixture tenants uses separate operation keys', () => {
  assert.notEqual(validateOrder({ ...base, caseId: 'one' }).idempotencyKey, validateOrder({ ...base, tenantId: 'other-synthetic-shop', caseId: 'two' }).idempotencyKey);
});
