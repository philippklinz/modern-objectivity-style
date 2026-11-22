# 04 — Visual Language

Modern Objectivity prescribes **reasoned visual organization**, not a universal style.

## Start with the information

Identify entities, relationships, tasks, actions, provenance, uncertainty, data age, and expected density before choosing aesthetics. A visually simple interface can still be difficult to understand.

## Geometry and hierarchy

Use alignment, proximity, spacing, shape, and boundaries to reveal relationships. A grid is a construction tool, not an arbitrary constraint. Lines may indicate a boundary, relation, sequence, or deliberate visual rhythm; avoid accidental diagram-like decoration.

## Typography

Define roles for page and section headings, body text, labels, code, technical identifiers, numeric data, help, and statuses. Choose fonts based on the application's content and language requirements. Test long names, variable-length translations, symbols, and confusable characters.

Use scale-aware sizing, readable line lengths, adequate spacing, and tabular figures where comparisons require aligned digits.

## Color and material

Use **semantic roles**: surface, text, interactive accent, focus, status, category, quantitative scale, and expressive atmosphere. Map these to a project-specific palette. Important meaning must not depend on color alone.

Material effects such as blur, shadows, glass, texture, and gradients may reinforce hierarchy or artistic expression but must not obscure content.

There is no official Modern Objectivity color, font, icon family, or logo.

## Responsive and dense layouts

Scientific tools may need compact density without sacrificing readability or input accessibility. Narrow screens may require alternate navigation rather than merely shrinking columns. Test real high-volume and edge-case content.

## Data and illustrations

Distinguish factual charts, explanatory diagrams, navigation graphics, and decorative imagery. Use units, legends, source information, and appropriate axes in factual charts. Never let an illustrative scale masquerade as a measurement.

## Token layering

- **Primitives:** raw values such as spacing and palette steps.
- **Semantic tokens:** purpose such as `text.primary`, `status.warning`, or `focus.visible`.
- **Component tokens:** purpose within a component such as `table.selected.background`.
- **Stage mapping:** context-specific visual expression.

Each token needs purpose, scope, variants, and maintenance ownership. Do not turn every one-off visual value into a global token.
