---
name: mindrails-map-commerce
description: Map Shopify, POS, inventory, shipping, and customer-email processes into an implementation-ready order-to-fulfilment blueprint. Use when connecting a shop to n8n or APIs, replacing manual order handling, or investigating stock and fulfilment inconsistencies. Identify sources of truth, lifecycle exceptions, and measurable acceptance criteria without changing live commerce data.
---

# MindRails · Map a commerce process

Build a process contract before proposing automation nodes.

## Gather evidence

Read supplied process notes, redacted examples, existing diagrams, and available configuration. Establish stores, locations, sales channels, order types, responsible operators, and integration versions. Separate **observed**, **reported**, **proposed**, and **unknown** statements. Use synthetic identifiers in public outputs. Never include customer addresses, payment details, or internal financial data.

Keep the task read-only unless the user authorizes implementation. Do not place orders, refund payments, purchase shipping labels, change inventory, or send customer messages as a “test.” For platform-specific APIs, fields, or event behavior, verify official documentation for the configured version. Do not invent endpoints or scopes.

## Create a source-of-truth matrix

For each object—product/variant, SKU, order, payment, location stock, fulfilment, shipment, customer consent—name its authoritative system, stable identifier, update owner, and conflict rule. Mark missing rules as decisions to resolve. Do not infer that Shopify is authoritative for every object.

Distinguish physical stock, reserved stock, and available-to-sell quantities. Do not assume the business uses a particular reservation model. Ask or inspect before defining inventory arithmetic. Never treat payment status as fulfilment status.

## Map the lifecycle

For each transition, specify trigger → preconditions → authoritative read → permitted write → recorded result → operator exception path. Cover:

- Order created but unpaid; payment confirmed; payment later reversed.
- Partial fulfilment and multiple shipping locations.
- Cancellation before and after label purchase or dispatch.
- Return received, refund issued, and restocking decision as separate events.
- Online and POS sales competing for the same last unit.
- Duplicate or out-of-order events and temporary integration downtime.

Attach each outbound message to a specific business transition. Separate transactional notices from marketing campaigns; record consent requirements as a business/compliance decision to verify, not a legal conclusion. Avoid promising that a particular classification automatically makes a message lawful.

## Prioritize implementation

Choose a small first workflow with a clear operator fallback. Define idempotency scope, reconciliation ownership, minimum access, and redacted logging. Use a separate automation review for code-level failure paths.

Compare effort and impact without invented savings: if a baseline is absent, propose how to measure it. For time savings use comparable periods and volumes, include exception handling and maintenance, and distinguish gross time removed from net savings. Label user estimates and overlapping work explicitly.

## Deliver

Return a concise business summary, source-of-truth table, transition table, exception matrix, prioritized first implementation, and acceptance criteria. Every criterion needs a fixture, expected state in each system, and evidence to collect. End with the few unresolved decisions that actually block implementation.

Use [the worked example](references/worked-example.md) as a format reference, not as evidence about the user's business.
