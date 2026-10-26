/** Synthetic order contract. No customer account, shop or shipping API is used. */
export function validateOrder(event) {
  const reject = (reason) => ({ caseId: event?.caseId ?? 'unknown', valid: false, reason });
  if (!event || typeof event !== 'object') return reject('INVALID_EVENT');
  for (const field of ['tenantId', 'orderId', 'caseId']) {
    if (typeof event[field] !== 'string' || !/^[A-Za-z0-9_-]{1,60}$/.test(event[field])) return reject('INVALID_ID');
  }
  if (event.paid !== true) return reject('ORDER_NOT_PAID');
  if (!Number.isSafeInteger(event.shipmentVersion) || event.shipmentVersion < 1) return reject('INVALID_SHIPMENT_VERSION');
  if (event.currency !== 'EUR' || !Number.isSafeInteger(event.totalCents) || event.totalCents < 1) return reject('INVALID_AMOUNT');
  if (!Array.isArray(event.items) || !event.items.length || event.items.length > 20) return reject('INVALID_ITEMS');
  if (event.items.some(item => !item || typeof item.sku !== 'string' || !/^[A-Za-z0-9_-]{1,60}$/.test(item.sku) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100)) return reject('INVALID_ITEMS');
  if (new Set(event.items.map(item => item.sku)).size !== event.items.length) return reject('DUPLICATE_SKU');
  const address = event.address;
  if (!address || address.country !== 'DE' || typeof address.postalCode !== 'string' || !/^\d{5}$/.test(address.postalCode)
    || typeof address.street !== 'string' || !address.street.trim() || address.street.length > 150) return reject('INVALID_ADDRESS');
  if (!['none', 'lost-response', 'transient', 'permanent'].includes(event.demoFault ?? 'none')) return reject('INVALID_DEMO_FAULT');
  // tenantId is a fixed fixture here. Production must derive it from authenticated ingress.
  const request = {
    tenantId: event.tenantId, orderId: event.orderId, shipmentVersion: event.shipmentVersion,
    currency: event.currency, totalCents: event.totalCents, paid: true,
    items: event.items.map(item => ({ sku: item.sku, quantity: item.quantity })).sort((a, b) => a.sku.localeCompare(b.sku)),
    address: { country: address.country, postalCode: address.postalCode, street: address.street.trim() },
    caseId: event.caseId, demoFault: event.demoFault ?? 'none',
  };
  return { caseId: event.caseId, valid: true, idempotencyKey: `${event.tenantId}:${event.orderId}:v${event.shipmentVersion}`, request };
}
