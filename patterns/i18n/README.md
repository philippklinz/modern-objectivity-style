# Copyable multilingual pattern

[Open the example](index.html) · [Programming guide](../../guides/multilingual-pattern.md) · [MO-13 requirement](../../docs/10-multilingual-access.md)

Copy this entire folder into an independent project. Open `index.html` directly, or serve it from any static server. All functional assets are local, including a verbatim copy of the reference CSS. Links to the parent style-kit documentation are optional and may be replaced in your copy. No package manager, account or build step is required to use the page.

| File | Responsibility |
| --- | --- |
| `languages.js` | 24 language tags, native names and explicit format locales |
| `locales/en.js` | Source messages and source fingerprint |
| `locales/<tag>.js` | Translated messages, matching source fingerprint and review disclosure |
| `i18n.js` | Validation, text/number formatting, explicit DOM bindings |
| `app.js` | Local pack loading, URL handling and rendering from unchanged model state |
| `index.html`, `demo.css` | Accessible sample panel and its local layout |
| `modern-objectivity.css` | Unmodified reference stylesheet copied from `styles/modern-objectivity.css` |
| `check.cjs`, `test.cjs` | Author-side coverage/freshness and behavior checks using Node built-ins |
| `browser-check.cjs` | Development-only Chromium regression checks with Playwright |

The 24 catalogues cover this panel's **13 message keys**, not the whole style kit or a complete learning lab. Translations are AI-assisted examples; independent language review is pending. The enclosing guide stays English; only the panel's `lang` changes. The arithmetic is an illustrative time budget, not a measurement or a physically validated simulation.

## Use and verify

```sh
cp -r patterns/i18n ../my-multilingual-lab
cd ../my-multilingual-lab
node check.cjs
node --test test.cjs
python3 -m http.server 8000
```

Node and Python are convenient authoring/checking tools, not requirements of the published site. For optional browser checks, install the test runner in your development checkout:

```sh
npm install --no-save playwright@1.56.1
npx playwright install chromium
node browser-check.cjs
```

The browser check starts and stops its own local server. `MO_BROWSER_EXECUTABLE` can select an installed Chromium binary. Set `MO_I18N_SCREENSHOT_DIR` to save representative screenshots. The repository CI runs the same checks. No dependency files need to be deployed with the static page.

## Adapting the pattern

Choose the module's source language, replace the sample messages and model, and update the HTML source fallback. Add translated leaf text and accessible attributes with stable keys. Translate dynamic feedback explicitly with `i18n.text()` and re-render graphics from existing state. For a complete page, update its title, metadata and document language too.

When source messages change, `node check.cjs` identifies stale packs. Read the source diff, revise only affected messages, check their meaning, then set the new source fingerprint in each reconciled catalogue. `node check.cjs --source-revision` only prints the new fingerprint; it never silently marks translations as current. Keep coverage separate from independent review.

The first pattern has no rich-text renderer, localized search index, runtime translation service or localized no-JavaScript HTML. Add those only for an actual use case, using the same central requirement. Unsupported exact language tags fall back explicitly; this sample does not infer `de` from `de-AT` automatically.

License: GPL-2.0-only, as in the included [LICENSE](LICENSE). Keep that license with redistributed copies.
