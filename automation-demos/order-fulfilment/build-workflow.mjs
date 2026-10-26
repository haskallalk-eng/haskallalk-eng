import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateOrder } from './validate.mjs';
import { fixtures } from './fixtures.mjs';

export function makeWorkflow(url = 'http://127.0.0.1:8787/fulfilments') {
  const code = (id, name, position, jsCode, mode = 'runOnceForAllItems') => ({ id, name, type: 'n8n-nodes-base.code', typeVersion: 2, position, parameters: { mode, jsCode } });
  const nodes = [
    { id: 'manual', name: 'Run synthetic examples', type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, position: [0, 200], parameters: {} },
    code('fixtures', 'Synthetic orders', [220, 200], `return ${JSON.stringify(fixtures, null, 2)}.map(json => ({ json }));`),
    code('validate', 'Validate order', [440, 200], `${validateOrder.toString()}\nreturn $input.all().map((item, index) => ({ json: validateOrder(item.json), pairedItem: { item: index } }));`),
    { id: 'valid', name: 'Order is valid', type: 'n8n-nodes-base.if', typeVersion: 2.2, position: [660, 200], parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 }, conditions: [{ id: 'valid-condition', leftValue: '={{ $json.valid }}', rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' }, options: {} } },
    { id: 'one-order', name: 'One order per retry boundary', type: 'n8n-nodes-base.splitInBatches', typeVersion: 3, position: [880, 100], parameters: { batchSize: 1, options: {} } },
    { id: 'http', name: 'Create or replay synthetic fulfilment', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [1100, 100], retryOnFail: true, maxTries: 3, waitBetweenTries: 1000, onError: 'continueRegularOutput', parameters: {
      method: 'POST', url, sendHeaders: true, headerParameters: { parameters: [{ name: 'Idempotency-Key', value: '={{ $json.idempotencyKey }}' }] }, sendBody: true, specifyBody: 'json', jsonBody: '={{ $json.request }}', options: { timeout: 2000, response: { response: { fullResponse: true, responseFormat: 'json' } } },
    } },
    code('outcome', 'Record outcome', [1340, 100], "const source = $('Validate order').item.json;\nconst confirmed = $json.statusCode === 200 && $json.body?.synthetic === true && typeof $json.body?.labelId === 'string';\nreturn { json: { caseId: source.caseId, result: confirmed ? 'fulfilled' : 'manual_review', ...(confirmed ? { labelId: $json.body.labelId, replayed: $json.body.replayed } : { reason: 'NO_CONFIRMED_FULFILMENT' }), synthetic: true } };", 'runOnceForEachItem'),
    code('rejected', 'Rejected before HTTP', [900, 350], "return $input.all().map((item, index) => ({ json: { caseId: item.json.caseId, result: 'rejected', reason: item.json.reason, synthetic: true }, pairedItem: { item: index } }));"),
    { id: 'note', name: 'About this demonstration', type: 'n8n-nodes-base.stickyNote', typeVersion: 1, position: [0, -100], parameters: { width: 680, height: 200, content: '## MindRails · n8n fulfilment reference\nEight synthetic cases. No shop login, real shipping label, email or customer data.\nStart the local fixture service first. Repeat execution to inspect replay behavior.\nThe mock API owns the durable demo ledger; n8n static data is not an idempotency lock.\nSee README for validation, limits and production requirements.' } },
  ];
  const edge = node => ({ node, type: 'main', index: 0 });
  return { name: 'MindRails – synthetic order fulfilment and replay', nodes, connections: {
    'Run synthetic examples': { main: [[edge('Synthetic orders')]] },
    'Synthetic orders': { main: [[edge('Validate order')]] },
    'Validate order': { main: [[edge('Order is valid')]] },
    'Order is valid': { main: [[edge('One order per retry boundary')], [edge('Rejected before HTTP')]] },
    'One order per retry boundary': { main: [[], [edge('Create or replay synthetic fulfilment')]] },
    'Create or replay synthetic fulfilment': { main: [[edge('Record outcome')]] },
    'Record outcome': { main: [[edge('One order per retry boundary')]] },
  }, settings: { executionOrder: 'v1' }, active: false, pinData: {}, tags: [] };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const path = new URL('./workflow.json', import.meta.url);
  const expected = JSON.stringify(makeWorkflow(), null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== expected) throw new Error('Workflow export differs from its source; run npm run workflow:build');
    console.log('Workflow export matches its validation and fixture sources.');
  } else { writeFileSync(path, expected); console.log('Wrote workflow.json'); }
}
