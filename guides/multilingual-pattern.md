# Programming Pattern — Local Catalogues, Shared State

[Open the working example](../patterns/i18n/index.html) · [Copyable files](../patterns/i18n/) · [Central requirement: MO-13](../docs/10-multilingual-access.md)

Keep three responsibilities separate: **model values**, **translated messages**, and **rendering**. Language changes re-render the current values. They never replace the model with a language-specific copy.

## 1. One source catalogue per module

The example has 13 message keys in each of 24 local files. Its source language is English; an existing lab may instead choose German. A catalogue is data wrapped in a classic script, allowing direct-file loading as well as static hosting without a JSON fetch or a build step.

The relevant part of `locales/en.js` is:

```js
messages: {
  title: "Sampling plan",
  samples: {
    plural: "count",
    forms: { one: "{count} sample", other: "{count} samples" }
  }
}
```

Polish supplies its own forms under the same key:

```js
samples: {
  plural: "count",
  forms: {
    one: "{count} próbka",
    few: "{count} próbki",
    many: "{count} próbek",
    other: "{count} próbki"
  }
}
```

Stable keys describe meaning, not current wording or a DOM position. Keep model constants, answer IDs and scientific datasets outside catalogues. Split a large lab into shared controls plus individual module catalogues; namespace keys before combining them, check both source revisions and load only those needed by the current page. The supplied example is intentionally one small module, not a general catalogue framework.

## 2. Bind presentation explicitly

```html
<h2 data-i18n="title">Sampling plan</h2>
<p id="summary">6 samples</p>
```

```js
const state = { count: 6, interval: 0.25 };
const i18n = MOI18n.create({
  languages: MOLanguages,
  sourceLocale: "en",
  catalogues: MOCatalogues
});

// After loading a local catalogue:
const result = i18n.select("pl");
i18n.apply(document.querySelector("#localized-demo"));
document.querySelector("#summary").textContent =
  i18n.text("samples", { count: state.count });

// Computation stays numeric; formatting belongs to the display.
const duration = state.count * state.interval;
const display = i18n.number(duration, { minimumFractionDigits: 2 });
```

`apply(root)` translates explicitly marked text leaves and the supported `aria-label`, `title` and `placeholder` bindings. It sets the scope's language. For a fully translated page, the scope can be `document.documentElement`, with a bound `<title>`; update metadata explicitly. For an English guide containing a translated panel, use the panel as the scope. Numeric feedback and the SVG description are rendered explicitly using the same helper.

Messages are inserted with `textContent` or named attributes. The helper does not interpret translated HTML. Use semantic DOM slots for rich paragraphs, links and emphasis when adding them; preserve reorderable full messages instead of assembling sentences from fragments. Do not mark containers containing live controls as replaceable text.

## 3. Load locally, switch atomically

`app.js` only accepts exact tags from `languages.js`, loads the selected local script once, and checks the catalogue before selecting it. An incomplete, stale or draft catalogue causes a whole-module source fallback with a visible notice. Unknown tags cannot become arbitrary script paths. Late responses from an earlier selection cannot override the latest choice; a failed request can be retried.

The URL uses `?lang=pl`. Explicit switches preserve other query parameters and hashes, and browser back/forward restores the language. A share link exposes the active language. No browser-language redirect, account, cookie or preference storage is involved. Existing language-less links remain valid. Other projects can choose their own URL convention if the same navigation contract is preserved.

The example's source pack is loaded first, so its readable English HTML remains the baseline. If JavaScript is disabled, initial source values are shown and interactive controls are disabled. For downloaded copies, classic scripts avoid the local-file restrictions associated with fetching JSON. Some browsers restrict History changes on `file://`; the share link still carries the language.

## 4. Detect stale work before release

Each pack records `status`, `sourceRevision` and `review`. In the example, status is `example`; a production module uses `available` only after the appropriate content and interaction checks. Planned/draft editions must not be listed as completed choices in a production selector.

```sh
node patterns/i18n/check.cjs
node --test patterns/i18n/test.cjs
```

The check hashes the canonical source messages and compares every pack against that fingerprint. It checks keys, placeholders and all plural categories for the chosen locale. Editing source text makes unreconciled translations fail. To print the new fingerprint without changing any files:

```sh
node patterns/i18n/check.cjs --source-revision
```

Review the source diff, update the affected translated messages, then record that fingerprint in each reconciled pack. Update the source pack's fingerprint too. Do not recopy or retranslate unchanged messages. This module-level approach intentionally favors a small, inspectable mechanism; per-key revision metadata can be introduced if a larger editorial workload justifies it.

The browser check covers all 24 choices at several widths, state preservation, plural output, accessible SVG text, URL navigation, failed loads, source fallback, rapid selection and direct-file use. Run it with a development-only Playwright installation as documented in the [pattern README](../patterns/i18n/README.md). Neither Node nor Playwright is shipped as a runtime dependency.

## Boundaries

The helper covers plain messages, cardinal plurals, named parameters and number formatting. It is not an ICU MessageFormat engine, automatic translator, rich-text CMS, localized search engine or lesson renderer. Long-form lessons, localized search indexes and Canvas/Three.js labels need explicit integration using the same keys and shared-state contract. It provides no independent guarantee of translation quality, scientific correctness or accessibility compliance.

If richer grammar or nested messages warrant an established formatter later, vendor and document it locally. Preserve the language-access contract rather than treating this small implementation as mandatory for every application.
