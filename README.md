# Modern Objectivity / Practical Style Kit

**Actual HTML and CSS for digital laboratories.** Not just a design manifesto.

[**Open the live style kit →**](https://philippklinz.github.io/modern-objectivity-style/)

## View the style

| Live example | What it demonstrates |
| --- | --- |
| [Style showcase](index.html) | Colors, typography, layout, cards, buttons, inputs, states, tables, charts and themes |
| [Lab console](examples/lab-console.html) | Functional data generation, plotting, filter/search, inspection, CSV export |
| [Interactive experiment](examples/experiment.html) | Real point–line–time wave model with sliders, play/pause, stepping and probing |
| [Multilingual pattern](patterns/i18n/index.html) | 24 local sample catalogues, plural forms, numeric formatting, checked source revisions and state-preserving language changes |
| [Starter lab](starter/index.html) | Copyable app shell for a new laboratory, with standalone CSS and JavaScript |

## Start a laboratory

```sh
git clone https://github.com/philippklinz/modern-objectivity-style.git
cp -r modern-objectivity-style/starter my-new-lab
cd my-new-lab
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

**No framework, build process or CDN required.** The starter folder includes its own `index.html`, `modern-objectivity.css` and `demo.js`. For implementation details see the [style specification](guides/visual-style-spec.md).

## Style in one snippet

```html
<link rel="stylesheet" href="modern-objectivity.css">
<div class="mo-card">
  <span class="mo-eyebrow">LAB / 01</span>
  <h3>Observation series</h3>
  <span class="mo-badge mo-badge-success">Ready</span>
  <button class="mo-btn mo-btn-primary">Run experiment</button>
</div>
```

## Design specification

- **Colors:** light canvas, graphite, peacock-teal accents; full light and dark themes with semantic tokens.
- **Typography:** Liberation Sans / Liberation Mono with system fallbacks.
- **Layout:** responsive laboratory rail, data panels, 4 px base spacing, deliberate hierarchy.
- **Components:** actions, inputs, tables, status, progress, tab navigation, charts.
- **Real demonstrations:** JavaScript behavior and generated values, explicitly marked as simulations.
- **Customization:** override semantic CSS tokens to develop your lab's own identity.

[Full visual specification](guides/visual-style-spec.md) · [Source CSS](styles/modern-objectivity.css) · [Starter instructions](starter/README.md).

## Design language documentation

**MO-13 requires complete user-facing journeys in all 24 official EU languages, including this entire published style guide, handbook and every example.** See the [central language-access requirement](docs/10-multilingual-access.md) and [programming pattern](guides/multilingual-pattern.md). English Markdown is the authoring source for translated handbook pages; published technical guidance follows the same language requirement. Translations are AI-assisted and await independent language review. Mechanical coverage and source-freshness checks do not certify their linguistic quality.

The practical style is one **reference implementation** of Modern Objectivity. The framework-neutral reasoning is documented separately:

1. [Introduction](docs/01-introduction.md)
2. [Philosophy](docs/02-philosophy.md)
3. [Principles](docs/03-principles.md)
4. [Visual language](docs/04-visual-language.md)
5. [Time and interaction](docs/05-time-interaction.md)
6. [Stage and identity](docs/06-stage-identity.md)
7. [Technical principles](docs/07-technical-principles.md)
8. [Validation](docs/08-validation.md)
9. [References](docs/09-references.md)
10. [Multilingual access](docs/10-multilingual-access.md)

The actual lab UI examples intentionally have a **specific aesthetic**. It can be modified without abandoning the design language.

**License:** [GNU GPL version 2 only (GPL-2.0-only)](LICENSE). **Version:** practical style v0.1.0-draft. Verify accessibility and scientific correctness for your real use cases.
