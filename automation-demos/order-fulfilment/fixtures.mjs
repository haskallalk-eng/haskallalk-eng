export const base = {
  tenantId: 'synthetic-shop', orderId: 'DEMO-100', shipmentVersion: 1, paid: true,
  currency: 'EUR', totalCents: 1990, items: [{ sku: 'DEMO-SHAMPOO', quantity: 1 }],
  address: { country: 'DE', postalCode: '10115', street: 'Synthetische Testadresse 1' },
};

export const fixtures = [
  { ...base, caseId: 'happy', expected: 'fulfilled' },
  { ...base, caseId: 'duplicate', expected: 'fulfilled' },
  { ...base, orderId: 'DEMO-200', caseId: 'lost-response', demoFault: 'lost-response', expected: 'fulfilled' },
  { ...base, orderId: 'DEMO-300', caseId: 'transient', demoFault: 'transient', expected: 'fulfilled' },
  { ...base, orderId: 'DEMO-400', caseId: 'permanent', demoFault: 'permanent', expected: 'manual_review' },
  { ...base, orderId: 'DEMO-CONFLICT', caseId: 'conflict', items: [{ sku: 'DEMO-SHAMPOO', quantity: 2 }], expected: 'manual_review' },
  { ...base, orderId: 'DEMO-500', caseId: 'unpaid', paid: false, expected: 'rejected' },
  { ...base, orderId: 'DEMO-600', caseId: 'invalid-address', address: { country: 'DE' }, expected: 'rejected' },
];
