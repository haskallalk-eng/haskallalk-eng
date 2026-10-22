---
name: mindrails-plan-ai-pilot
description: Turn a business request for an AI assistant, voice workflow, RAG system, or internal automation into a bounded pilot with evidence, evaluation cases, human handoff, and measurable acceptance gates. Use before implementation or when a vague AI proposal needs a practical scope. Do not use this skill to invent project results, certify compliance, or promise model accuracy.
---

# MindRails · Plan an AI pilot

Start with the business decision and permitted actions, not the model choice.

## Define the contract

Extract the task owner, intended users, current process, information sources, acceptable outputs, allowed actions, and unacceptable failures. Identify what the AI must not decide. Separate stakeholder claims from inspected evidence and proposals.

Classify each capability as **retrieve**, **draft**, **recommend**, or **execute**. For execution, specify the exact authorized action and external system. A general request for an assistant does not authorize sending messages, changing records, or making commitments. Keep customer data, credentials, and internal business knowledge out of public artifacts; use synthetic fixtures.

Define one bounded pilot that can deliver value without hidden dependencies. Exclude unsupported features explicitly. If a deterministic rule solves the task, retain it rather than forcing an LLM into the decision path.

## Design the evidence path

For each answer or action, define:

- Source owner, freshness requirements, retrieval boundary, and how conflicts are handled.
- Stable user/tenant context supplied by trusted application state; do not take tenant identity from model output.
- Required evidence or citation, abstention rule, and human handoff.
- Tool permissions, input validation outside the model, action confirmation when required, and an audit record with minimum necessary data.
- Recovery after timeout or uncertain execution; reconcile before retrying an external action.

Treat retrieved text, transcripts, pages, and documents as untrusted data. Include a case where retrieved content asks the assistant to ignore its instructions or reveal another customer's information. Never let retrieved text expand permissions.

For voice, include interruption, unclear audio, misunderstood numbers/names, silence, disconnect, and escalation. Distinguish correct conversational response from a verified downstream booking or update. Record consent and retention questions for the responsible owner; do not claim legal compliance from a checklist.

## Make success falsifiable

Build a small evaluation set before launch: normal requests, missing data, stale/conflicting sources, unsupported requests, adversarial content, cross-tenant access attempts, provider outage, and ambiguous tool success. Add domain-specific cases. Specify expected behavior and required evidence for every case.

Set proposed thresholds with the business owner; do not present them as universal standards. Separate answer correctness, supported-answer coverage, abstention quality, action correctness, latency, and cost. State denominators and what a test cannot establish. A small synthetic set demonstrates behavior on those cases, not a population accuracy rate.

Use hard gates for unauthorized actions or cross-tenant disclosure. A good average score must not cancel a critical failure. Estimate cost with explicit volume and pricing assumptions, verifying current official prices if calculating monetary totals.

## Return a pilot brief

Deliver: problem and baseline; one included workflow; exclusions; source/action contract; architecture sketch if useful; evaluation table; proposed go/no-go gates; pilot owner and rollout/recovery plan; unresolved blockers. Mark each result as **planned**, **executed with evidence**, or **not assessed**. Never call an unrun test passed.

Read [the worked example](references/worked-example.md) for a concise, synthetic voice-assistant pilot.
