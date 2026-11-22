# Data Visualization Guidelines

A visualization begins with a question, not a chart style.

## Select representation by purpose

- **Temporal change:** a time series or annotated timeline.
- **Exact values:** a table or directly labeled representation.
- **Distribution:** appropriate distribution plots.
- **Relationship:** network, matrix, or hierarchical view.
- **Position:** a map or other coordinate-based representation.

## Interpretive integrity

- Identify quantities, units, time windows, and meaningful baselines.
- Separate missing, zero, unknown, and not applicable.
- Label measurements, simulations, and predictions distinctly.
- Explain transformations, aggregation, normalization, and uncertainty.
- Show provenance and freshness when interpretation depends on them.
- Avoid color-only distinctions; provide legends and accessible value alternatives.
- Never use decoration that looks like measured data without clearly distinguishing it.

## Interaction

Support useful overview-to-detail navigation. Do not let animated transitions hide factual values. Avoid automatic refreshing that disrupts focus or reading.

## Example: measurement gaps

**Bad:** a sensor line connects across three missing readings, implying continuous observation.

**Better:** mark the gap, show the sampling interval and latest valid measurement, and expose a table of original values.

## Review question

Can a reader correctly tell what was measured, when, how uncertain it is, and what was not observed?
