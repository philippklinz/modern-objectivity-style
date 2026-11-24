# 07 — Technical Principles

## Implementation is a design constraint

Prototype complete interaction slices early. Test representative data, input, loading, failures, long strings, permissions, and scale. A visually polished image is not a working component.

## Accessibility

For applicable web projects, consider [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level AA as a baseline; concrete legal requirements are context-specific. This handbook does not certify compliance.

Prefer semantic native controls. Test keyboard navigation, focus visibility, labels, assistive technology, zoom and reflow, contrast, and alternatives to complex visual gestures. Automated checks are insufficient on their own.

## Performance and robustness

Set locally meaningful budgets for devices, latency, data volume, and memory. Do not assume universal performance numbers. Consider pagination, virtualization, server-side filtering, reduced-complexity display, or degraded-mode operation when necessary.

Test slow and missing responses, duplicate actions, changing permissions, and unknown outcomes.

## Internationalization

Implement [MO-13: Multilingual Access](10-multilingual-access.md): complete user-facing journeys in all 24 official EU languages. Keep model values separate from keyed message catalogues, use locale-aware formatting and plural rules, and preserve application state when changing language. Test long text, Greek/Cyrillic glyphs, accessible descriptions and failure paths.

The [local-catalogue programming pattern](../guides/multilingual-pattern.md) supplies a working static example, source-revision checks and a copyable helper. It requires no remote translation service or cross-repository runtime. Coverage, source freshness and linguistic review are separate properties; report partial rollout honestly.

## Component contracts

A shared component specifies purpose, inputs, outputs, events, states, focus behavior, keyboard and screenreader behavior, semantic tokens, variants, errors, performance assumptions, tests, and versioning.

See [Component Contract](../templates/component-contract.md).

## Versioning

Treat changes in status semantics, accessibility, component APIs, and design tokens as potentially breaking. Record the reason, scope, owner, migration strategy, and test results.

A local rule can move through **draft → evaluated → adopted → superseded**.

## Transparency and security

Do not imply a security property from appearance alone. Show permission and failure states accurately, without exposing secrets in client-side messages or logs.
