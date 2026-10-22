# Worked example · One item, two sales channels

Synthetic input: a shop has online and POS sales, one location, and a shipping tool. Operators report occasional overselling. The inventory authority and reservation policy are not supplied.

## Useful output

**Do not diagnose a confirmed API bug.** First identify who owns available-to-sell stock and when each channel reserves it. The report establishes a requirement for a shared authoritative allocation decision; the implementation is still open.

| Object | Known | Unresolved decision |
| --- | --- | --- |
| SKU | Both channels use SKU DEMO-001 | Confirm variant mapping and uniqueness |
| Stock | One physical location | Which system owns allocation, reservation, and reconciliation? |
| Order | Online and POS each create orders | Establish channel-qualified order identifiers |
| Shipment | Shipping tool creates labels | Confirm when an order becomes eligible and how labels are reconciled |

| Exception | Required behavior |
| --- | --- |
| Online and POS compete for the last unit | Shared allocation yields at most one confirmed allocation; other sale follows an explicit backorder/rejection rule |
| A paid order is cancelled before label creation | Recheck state and stop shipping; handle stock release under the verified reservation policy |
| A return is refunded before goods are received | Do not infer sellable stock from refund alone; require a separate restocking decision |
| Shipping callback is delayed | Do not mark an order delivered based on a label-created event |

## First implementation

Pilot a read-only discrepancy report before enabling automatic stock corrections. Include SKU, location, observation timestamp, systems compared, and the rule used. An unexplained discrepancy creates an operator task; it does not overwrite stock.

## Acceptance evidence

Use a sandbox or synthetic event log for the last-unit race, duplicate delivery, cancellation, partial shipment, and return/refund separation. Record expected versus actual state and unresolved cases. Measure current manual minutes per eligible order over a declared baseline period before proposing savings. No actual savings or completed execution tests are asserted here.
