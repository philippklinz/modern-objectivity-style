# Component Patterns

A reusable component is a contract for behavior **and** presentation, not a screenshot.

## Search

- Make current filters legible and revisable.
- Distinguish an empty dataset from zero matching results.
- Avoid presenting unknown totals as exact counts.

## Lists and details

- Keep keyboard focus and selection distinct.
- Preserve relevant filter and navigation context when returning from a detail.
- Test long labels, missing fields, and high-volume collections.

## Forms

- Provide persistent labels and actionable validation messages.
- Explain whether changes are pending, saved, or rejected.
- Prevent harmful duplicate submissions.
- Provide recovery for destructive actions where feasible.

## Dialogs and panels

- Use modal interruption only when necessary.
- Move and restore focus predictably.
- Describe consequences, not merely “Are you sure?”

## States

Specify initial, loading, ready, empty, no-results, partial, stale, error, forbidden, and disabled only where relevant. A spinner alone cannot explain a failed operation.

## Reference contract

```text
Component: EntityBrowser
Purpose: search and inspect records
Inputs: records or data source, filters, selection
States: initial, loading, ready, empty, no-results, error
Events: filter-change, select, retry
Accessibility: semantic labels, keyboard, restored focus
Variants: comfortable, compact
Evidence: keyboard test, realistic data, error/empty states
```

Extend with the [Component Contract template](../templates/component-contract.md).
