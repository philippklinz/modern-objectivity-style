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

Separate translatable text from layout. Support appropriate number, time, and date formats. Test diacritics, long translated strings, and mixed technical identifiers. Language support must be implemented and checked rather than merely advertised.

## Component contracts

A shared component specifies purpose, inputs, outputs, events, states, focus behavior, keyboard and screenreader behavior, semantic tokens, variants, errors, performance assumptions, tests, and versioning.

See [Component Contract](../templates/component-contract.md).

## Versioning

Treat changes in status semantics, accessibility, component APIs, and design tokens as potentially breaking. Record the reason, scope, owner, migration strategy, and test results.

A local rule can move through **draft → evaluated → adopted → superseded**.

## Transparency and security

Do not imply a security property from appearance alone. Show permission and failure states accurately, without exposing secrets in client-side messages or logs.
