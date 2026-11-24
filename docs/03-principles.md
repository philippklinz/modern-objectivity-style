# 03 — Fundamental Principles

The following principles guide implementation and review. Apply them to actual tasks and verify their implementation with appropriate evidence. MO-13 defines the required language-coverage baseline; partial implementation must be identified explicitly.

| ID | Principle | Practical review question |
| --- | --- | --- |
| **MO-01** | **Purpose before appearance.** State the functional or expressive aim of a decision. | Why does this choice exist? |
| **MO-02** | **Honest representation.** Preserve the meaning of data, uncertainty, status, and relationships. | Can users correctly interpret the information? |
| **MO-03** | **Consistency of equivalent behavior.** Similar actions within one environment should behave similarly. | Can knowledge transfer between modules? |
| **MO-04** | **Controlled diversity.** Define invariants, variables, and expressive freedoms. | Is variation intentional and scoped? |
| **MO-05** | **Reuse before reinvention.** Examine tested components before writing new equivalents. | What existing solution was considered? |
| **MO-06** | **Design time and states.** Consider waiting, success, errors, partial data, and recovery. | What happens before, during, and after an action? |
| **MO-07** | **Engineering is part of design.** Evaluate feasibility with real operating constraints. | Can the proposal function with realistic conditions? |
| **MO-08** | **Accessibility is foundational.** Provide usable navigation, input, and perception paths. | Are essential tasks accessible? |
| **MO-09** | **Structure complexity without hiding it.** Keep essential detail discoverable. | Can users move from overview to detail? |
| **MO-10** | **Validate design claims.** Test hypotheses and document what was actually observed. | What evidence supports the claim? |
| **MO-11** | **Make systems explainable.** Communicate state, causes, and consequences. | Can someone tell what the system does and why? |
| **MO-12** | **Emotion as Function.** Consider emotional and aesthetic effects as legitimate goals, not assured results. | Is the intended experience supported and ethically appropriate? |
| **MO-13** | **Language is part of access.** Provide complete user-facing journeys, including the published guide, handbook and examples, in all 24 official EU languages, with honest coverage status. | Can people understand the content, operate the interface and receive feedback in their selected language? |

## Applying the rules

**Honesty:** Distinguish zero from missing, observations from predictions, and decorative charts from measured data.

**Consistency:** A specialist module may have a unique diagram without inventing its own universal navigation or error behavior.

**Realism:** A mockup cannot demonstrate keyboard handling, resilience to long identifiers, performance, or successful error recovery.

**Accessibility:** Test keyboard navigation, visible focus, semantic labels, magnification, and alternatives to pointer-only interactions.

**Language access:** Design translations, plural forms, flexible layouts and state-preserving language changes from the start. Follow [Multilingual Access](10-multilingual-access.md), the central requirement, and the [working programming pattern](../guides/multilingual-pattern.md). A phased rollout must not be advertised as complete 24-language support.

**Validation:** A design can be attractive and still fail its task; a successful task can still feel stressful. System performance, behavior, and subjective reports are different evidence sources.

## When principles conflict

Record the purpose, options, tradeoffs, and evaluation in a design decision record. For example, a 3D scientific graph may support exploration but require a table for exact values or non-spatial access. Never trade away truthful reporting or required accessibility for decorative novelty.
