# Example — Modular Research Console

**Illustrative design scenario; no user study has been completed for this example.**

A shared research application hosts independently authored modules for instruments, datasets, and experiment results. Each has different domain content but relies on common navigation, search, selection, and feedback.

**Hypothesis:** people transfer learned list/detail workflows more readily between modules using the same conventions.

**Host invariants:** navigation, search semantics, state feedback, permission display, focus behavior.

**Module freedoms:** domain-specific data, specialist visualizations, contextual actions and explanatory diagrams.

**Prototype:** implement two distinct modules using one list/detail component contract. Include long identifiers, missing fields, slow requests, network errors, and permission denial.

**Evaluation plan:** ask participants to locate records, open detail views, return without losing filters, and recover after failure. Observe actions and ask about subjective clarity. Define criteria before the test.

**Decision:** if the shared pattern creates a domain-specific obstacle, revise its contract or record a justified exception.
