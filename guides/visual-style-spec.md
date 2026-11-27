# Visual Style Specification — Reference Lab Theme v0.1

This page documents the **actual CSS implementation**, not theoretical recommendations. The [style showcase](../index.html) and working laboratories use [the same source stylesheet](../styles/modern-objectivity.css). The [starter](../starter/) and [multilingual pattern](../patterns/i18n/) include standalone copies.

## 1. Concrete visual direction

- **Character:** structured laboratory instrument / editorial technical interface.
- **Composition:** deep graphite navigation rail, precise typography, restrained low-relief cards, thin lines, high information density with generous reading space.
- **Default:** light canvas with teal action accent; dark mode supported through semantic tokens.
- **Type:** Locally served Liberation Sans Web for UI and reading, Liberation Mono Web for technical labels and figures, Liberation Serif Web for editorial accents; system fallbacks remain available.
- **Layout:** 4 px base rhythm, square corners (0 px radius) on all UI containers and controls, clear type hierarchy.
- **Interaction:** visible focus, semantic status distinctions, filterable data, explicit handling of empty/error states.

This is the first **practical example skin**, not a restriction that every adopting project must use the same colors.

## 2. Primary tokens

| Token | Light reference | Dark reference |
| --- | --- | --- |
| `--mo-bg` | `#F3F7F7` | `#08191E` |
| `--mo-surface` | `#FFFFFF` | `#10272D` |
| `--mo-text` | `#132C32` | `#D7E8E9` |
| `--mo-muted` | `#506970` | `#A2BAC0` |
| `--mo-border` | `#CFDDDE` | `#2A4A52` |
| `--mo-accent` | `#007E77` | `#49D9C6` |
| `--mo-accent-active` | `#00625F` | `#82EEE0` |
| `--mo-focus` | `#0B9FBE` | `#81D8FF` |

For all values, including status colors, consult the CSS. Recheck contrast before changing tokens.

[Explore families, languages and subset loading in the typography lab](../examples/typography.html).

## 3. Responsive layout

The full shell uses a 254 px navigation rail and fluid content area. At 900 px width or narrower, navigation becomes a horizontal, scrollable section. At 640 px or narrower, content grids become single-column. Data tables maintain readable columns and scroll horizontally rather than compressing values beyond recognition.

## 4. Core components

| Component | CSS classes | Functional usage |
| --- | --- | --- |
| App shell | `mo-shell`, `mo-sidebar`, `mo-main`, `mo-topbar` | Navigation + content |
| Cards and panels | `mo-card`, `mo-panel`, `mo-grid-2/3/4` | Group relevant information |
| Actions | `mo-btn`, `mo-btn-primary`, `mo-btn-danger` | Distinct hierarchy and risk |
| Fields | `mo-field`, `mo-input`, `mo-select`, `mo-range` | Accessible label + input |
| Status | `mo-badge-*`, `mo-note-*` | Success, warning, error, info |
| Tables | `mo-table-wrap`, `mo-table`, `mo-num` | Numeric alignment + overflow |
| Charts | `mo-chart`, `mo-chart-line`, `mo-chart-grid` | Visual layer, SVG content |
| Tabs | `mo-tabs`, `mo-tab` | Use ARIA tab and panel semantics |
| Progress | `mo-progress`, `mo-meter` | Actual or **clearly labeled simulated** progress |

## 5. A real HTML component

```html
<article class="mo-card">
  <div class="mo-card-head">
    <h3>Experiment 04</h3>
    <span class="mo-badge mo-badge-success">Ready</span>
  </div>
  <p class="mo-muted">12 recorded samples</p>
  <button type="button" class="mo-btn mo-btn-primary">Inspect results</button>
</article>
```

A lab should implement a meaningful handler for its actions. Styling alone does not create behavior.

## 6. Change the style for your own lab

Override semantic roles rather than replacing each component selector:

```css
/* Place after the reference stylesheet. */
:root {
  --mo-accent: #6854aa;
  --mo-accent-active: #503d87;
  --mo-accent-light: #eee9fb;
}
[data-theme="dark"] {
  --mo-accent: #b4a0ff;
  --mo-accent-active: #d0c5ff;
  --mo-accent-light: #342d49;
}
```

Check contrast, focus visibility and status differentiation again after any palette changes.

## 7. What works in the examples

- [Style showcase](../index.html): theme switching, active tabs, input controls, filterable table, simulated progress and toast feedback.
- [Lab console](../examples/lab-console.html): local synthetic data generation, status classification, filtering, detail inspection, chart updates and CSV export.
- [Live experiment](../examples/experiment.html): mathematically defined wave, changing parameters, pause, play, step, reset and inspectable probe values.
- [Standalone starter](../starter/index.html): working application shell, local synthetic observations, search, filtering, CSV export and clear empty state.
- [Multilingual pattern](../patterns/i18n/index.html): a 24-language sample panel with local catalogues, number/plural formatting, state-preserving switches and source checks. [MO-13](../docs/10-multilingual-access.md) applies to the entire published style kit, all examples and handbook content.

**Data integrity:** Every generated value is explicitly labeled synthetic. No example implies a real instrument has been connected or a user study has been completed.

## 8. Implementation limits

The stylesheet is a concrete starting point; it does not certify WCAG compliance or universal usability. Verify it on target browsers, devices and assistive technologies before deploying a production laboratory. No backend, authentication, storage or external instrumentation is provided.
