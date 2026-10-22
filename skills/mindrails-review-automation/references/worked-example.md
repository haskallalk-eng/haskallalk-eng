# Worked example · Duplicate shipping labels

All identifiers and behavior below are synthetic.

## Input

Webhook `order.paid` → read `processed[order_id]` → create shipping label → send confirmation → set processed=true. Two deliveries can run concurrently. The shipping API accepts a stable client reference but its idempotency behavior is not documented in the supplied material. An email failure retries the full workflow.

## Review excerpt

| Side effect | Current protection | Finding | Repair to verify |
| --- | --- | --- | --- |
| Label creation | Processed flag after all steps | Both runs can read false; an email failure also repeats label creation | Atomically claim shop + order + shipment revision; record label state separately; reconcile a timed-out create using client reference before another create |
| Confirmation email | Same processed flag | Full-flow retry can resend or duplicate labels | Separate email state and deterministic message intent; check provider support for idempotency or reconciliation; route ambiguous outcomes to review |

**Blocker:** The described check and write are separate, so simultaneous deliveries can both create a label. This is a design finding based on the supplied sequence, not an observed incident.

**Needs evidence:** A stable client reference may support lookup, but does not itself prove provider-side deduplication. Confirm the API contract before claiming exactly-once delivery.

## Pilot test matrix

| Scenario | Observable assertion |
| --- | --- |
| Same event twice | At most one label creation for the same shipment intent |
| Two workers simultaneously | Only one worker owns the claim; the other waits or exits safely |
| Provider succeeds, response lost | State becomes unknown; lookup resolves it before retry |
| Email fails after label succeeds | Existing label is reused; only the unresolved email step is considered |
| Order cancelled before retry | Recheck authoritative state; do not ship a cancelled order |
| Invalid address | No automatic retry loop; redacted operator task contains the validation reason |

**Verdict:** Blocked for unattended launch. Run these scenarios against fakes or an authorized sandbox after repairing state handling. This example performs no live API calls and reports no executed test results.
