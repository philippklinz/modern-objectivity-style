# 08 — Applications & Validation

## Validation by Design

Design is a hypothesis about function, interpretation, or experience. Use an iterative process:

1. Describe the problem and context.
2. Set functional and, when relevant, emotional goals.
3. Identify a falsifiable or otherwise examinable assumption.
4. Build a representative working prototype.
5. Select success criteria before collecting results.
6. Observe behavior, system properties, and subjective reports.
7. Record limitations and contradictory evidence.
8. Adopt, narrow, change, or reject the design; repeat as needed.

## Dimensions

| Dimension | Typical evidence |
| --- | --- |
| Domain correctness | Reference data and expert review |
| Task completion | Realistic task tests, error analysis |
| Interpretability | Explanation questions |
| Feasibility | Working implementation |
| Accessibility | Keyboard, zoom, screenreader tests |
| Language access | Complete journey coverage, source freshness, language-specific plurals/formatting, translated graphics and state-preserving switches |
| Robustness | Failure and edge-case tests |
| Performance | Instrumented measurements |
| Emotional experience | Subjective feedback and behavioral observation |
| Aesthetic intention | Contextual design critique |
| Maintainability | Component and integration review |

## Evidence levels (proposed)

- **E0:** untested idea.
- **E1:** static representation.
- **E2:** functional prototype under limited conditions.
- **E3:** evaluated implementation with documented criteria.
- **E4:** behavior observed in real use and assumptions revisited.

These classify **evidence type**, not universal quality. Do not call an E1 mockup “tested”.

## Component baseline

For reusable components, test normal content; empty versus no results; errors and permission denial; long and large datasets; keyboard/focus; relevant locales; loading and retries; integration with the host.

Document exceptions if a scenario is not applicable.

For [MO-13](10-multilingual-access.md), inventory every published page, handbook chapter and example, then check each language for complete content, missing keys, stale source revisions, placeholder changes and plural forms. Check prose, tables, navigation, metadata and link destinations alongside controls, feedback, graphics and accessible descriptions. Test fallback, deep links, back/forward, long text and Greek/Cyrillic text. Automatic coverage checks do not establish linguistic or scientific correctness. Record translation review separately; keep unimplemented coverage visible.

## Emotional Intent validation

Define the desired experience, possible mechanism, adverse effects, and suitable investigation. Distinguish **measured system properties**, **observed user behavior**, and **subjective reports**. A quick task may still be stressful, and a compelling simulation may not teach the underlying principle.

## Illustrative test scenarios

**Research console:** Can participants transfer search and detail navigation knowledge between independently authored modules?

**Learning simulation:** Does visible cause-and-effect support exploration and correct conceptual understanding? Do reported feelings match the intended curiosity?

**Sensor dashboard:** Can participants identify freshness, missing values, units, and uncertainty?

These are test designs, **not completed studies**.

Use the [Validation Plan](../templates/validation-plan.md) and [Design Decision Record](../templates/design-decision-record.md).
