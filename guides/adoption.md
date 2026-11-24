# Adopting Modern Objectivity

Modern Objectivity is a design language, not a prebuilt UI theme. Adoption starts with the real task.

1. **Inventory:** identify users, contexts, tasks, content, states, data relationships, constraints, and recurring failures.
2. **Stage:** define a [Stage Profile](../templates/stage-profile.md), separating invariants, variables, and expressive freedoms.
3. **Principles:** review the [principles](../docs/03-principles.md), including the required [24-language access baseline](../docs/10-multilingual-access.md), and record implementation gaps explicitly.
4. **Prototype:** build one meaningful working journey with realistic data, errors, navigation, and accessible interaction.
5. **Validation:** create a [Validation Plan](../templates/validation-plan.md); decide what would count as success before testing.
6. **Reuse:** develop component contracts for repeated interaction patterns.
7. **Govern:** preserve rationale, versioning, results, and the decisions made.

## Minimal adoption checklist

- [ ] Problem, context, and intended tasks are documented.
- [ ] Stage-level navigation and semantics are explicit.
- [ ] The visual identity is locally specified, rather than inherited by default.
- [ ] Loading, empty, no-results, and failure states are addressed.
- [ ] Data presentations are accurate and explainable.
- [ ] Core tasks are accessible by supported input methods.
- [ ] The 24-language baseline covers content, interactions and accessible feedback; partial coverage is identified, with a migration path.
- [ ] Message catalogues, source freshness and language review follow the [programming pattern](multilingual-pattern.md) or an equivalent documented implementation.
- [ ] Emotional Intent, where relevant, is stated without promising a guaranteed effect.
- [ ] Critical claims are accompanied by observations or a declared test plan.
