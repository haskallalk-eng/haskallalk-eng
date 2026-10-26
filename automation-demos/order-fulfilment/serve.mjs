import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { startMockApi } from './mock-api.mjs';
const dir = resolve('.demo-state'); mkdirSync(dir, { recursive: true });
const api = await startMockApi({ stateFile: resolve(dir, 'ledger.json'), port: 8787 });
console.log(`Synthetic fixture service: ${api.url}\nLocal ledger: .demo-state/ledger.json\nNo real labels or provider calls. Stop with Ctrl+C.`);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await api.close(); process.exit(0); });
