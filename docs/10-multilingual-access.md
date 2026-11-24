# 10 — Multilingual Access

**MO-13: language is part of access.** Applications adopting Modern Objectivity must provide complete user-facing journeys in all **24 official EU languages**. The same requirement applies to the entire published Modern Objectivity style guide, handbook, technical guidance and every example. Additional languages are welcome.

Implementations may expand coverage incrementally, but must report partial coverage honestly. A language selector, translated navigation or a list of planned languages does not establish a translated application.

This document is the central requirement. The [programming pattern](../guides/multilingual-pattern.md) supplies a practical static implementation; application repositories own their content, release schedule and local copies. They must not depend on this website at runtime.

## Language baseline

Use language tags and native names. Flags identify countries, not languages. A language tag need not dictate a single regional format: state any chosen regional conventions explicitly.

| Language | Native name | Tag |
| --- | --- | --- |
| Bulgarian | Български | `bg` |
| Croatian | Hrvatski | `hr` |
| Czech | Čeština | `cs` |
| Danish | Dansk | `da` |
| Dutch | Nederlands | `nl` |
| English | English | `en` |
| Estonian | Eesti | `et` |
| Finnish | Suomi | `fi` |
| French | Français | `fr` |
| German | Deutsch | `de` |
| Greek | Ελληνικά | `el` |
| Hungarian | Magyar | `hu` |
| Irish | Gaeilge | `ga` |
| Italian | Italiano | `it` |
| Latvian | Latviešu | `lv` |
| Lithuanian | Lietuvių | `lt` |
| Maltese | Malti | `mt` |
| Polish | Polski | `pl` |
| Portuguese | Português | `pt` |
| Romanian | Română | `ro` |
| Slovak | Slovenčina | `sk` |
| Slovenian | Slovenščina | `sl` |
| Spanish | Español | `es` |
| Swedish | Svenska | `sv` |

The [copyable language registry](../patterns/i18n/languages.js) implements these tags. The example uses `en-GB` and `pt-PT` for English and Portuguese number/plural formatting; its content tags remain `en` and `pt`.

## What must be translated

Complete journeys include navigation, teaching content, controls, input help, validation, loading/empty/error states, exercise questions and answers, feedback, search vocabulary, glossary definitions and recovery paths. Include text inside charts, SVG, Canvas and 3D views, and accessible equivalents such as labels, descriptions and announcements. Translate headings, paragraphs, tables, link labels, image descriptions, document titles and metadata throughout the published guide and handbook.

Preserve scientific meaning: evidence, uncertainty, dates, signs, units, model limitations and answer correctness. Equations, executable source code, API identifiers, sequences, raw data and taxonomic names are shared; translate their explanations and all user-facing text rendered by examples. Original bibliographic titles and attributed quotations may remain in their original language with an appropriate language indication. Preserve the authoritative GPL license text; translate surrounding licensing guidance without presenting it as a replacement legal text. External source documents need not be translated. Personal notes remain as authored.

English Markdown remains this repository's authoring source. Its published handbook editions must carry the complete content in all 24 languages, including contributor and implementation guidance. Technical subject matter and an embedded translated component do not exempt the surrounding page from coverage. Set the page language to the language actually displayed, and identify preserved foreign-language passages separately.

## Interaction and visual requirements

- Make language choice visible and keyboard-accessible. Use native names, a real control label and a stable shareable URL. Preserve the language across supported chapter links and return paths.
- Language switching updates the presentation of the current state. Preserve inputs, selections, results, notes and progress; do not restart a model or generate new random data to translate its output.
- Translate whole messages with named placeholders. Support the language's plural categories and number/date conventions; do not concatenate translated sentence fragments or format data by replacing punctuation.
- Set `lang` on the actual document or component and on foreign-language passages where needed. Update accessible descriptions together with visible labels.
- Allow text to wrap and controls to grow. Verify long translations, diacritics, Greek and Cyrillic glyphs, keyboard operation, zoom and narrow layouts. Do not solve overflow by hiding meaningful text.
- Keep translations available under the application's existing open-source/content licensing. Static labs retain **STATIC BY DESIGN · OPEN ACCESS · OPEN SOURCE · NO ACCOUNTS · NO TRACKING**. Language selection requires no account, telemetry or remote translation service.

## Architecture and ownership

Maintain one application/model implementation with separate, local message catalogues. Use stable semantic keys, an explicit source language per module, a terminology glossary and source-version information. Reuse the coding convention without creating a mandatory cross-repository runtime. Local copies should record their upstream revision and can evolve independently.

The source language is an editorial choice: an existing German lab can retain German, while this guide uses English. Translate against that source and its shared data; avoid untracked chains of translation through other languages. Source-language authoring does not narrow the published language baseline.

Treat each lesson/module and its shared controls as a publication unit. Keep coverage (`planned`, `draft`, `available`) separate from source freshness and review provenance. The runtime must not advertise a draft, incomplete or stale pack as a complete language edition. A full lab is available in a language only when its entry page, every included module and shared controls are available and current.

For a missing or invalid pack, keep a usable source-language module and clearly identify the fallback in the language actually displayed. Never silently label source-language content as the requested language. A failed switch must preserve the user's state.

## Efficient translation maintenance

1. Author or revise a message in the module's source catalogue, or edit the English Markdown for handbook content. Keep context and terminology close to the text; do not duplicate model data in translated files.
2. Use version-control diffs to translate only affected messages. A module-level source fingerprint identifies stale packs; large modules can later use per-key fingerprints without changing the user-facing contract.
3. Check the complete published page inventory, key coverage, placeholders, plural forms and source freshness automatically across all 24 languages. Include handbook content, navigation, dynamic feedback and accessible text. Review semantic equivalence and rendering separately. A complete key count cannot establish linguistic or scientific accuracy.
4. Update a translation's source revision only after reconciling the changed text. Do not mass-update revision fields to silence a failed check. Changes to model assumptions also require checking associated explanations.
5. Record AI assistance and independent review accurately. AI-assisted publication is possible; do not imply professional, native-speaker or specialist verification that has not occurred. No paid translation service is required.

## Reference status and adoption

The [working sample](../patterns/i18n/index.html) demonstrates local message catalogues, plurals, formatting, source fallback and state-preserving language changes. Its small sampling module remains a copyable programming example; the containing page, the rest of the style kit and the complete handbook follow the same 24-language publication requirement.

The showcase, console, experiment, dashboard starter, multilingual pattern and handbook belong to one publication scope. Coverage must be checked across all of them before claiming a complete edition. Translations are AI-assisted and await independent language review; mechanical checks establish coverage and source consistency, not professional linguistic verification or scientific validation.

State each delivery choice explicitly: a page may use local JavaScript catalogues or generated static language editions. A source-language fallback must be labeled as such and must not be counted as a translated edition. If a project requires localized no-JavaScript documents or independently indexed language pages, generate those from the same maintained content. Runtime dependencies and offline limitations must remain visible.

## References

- [European Union: Languages](https://european-union.europa.eu/principles-countries-history/languages_en), official list checked 24 November 2026.
- [W3C: Declaring language in HTML](https://www.w3.org/International/questions/qa-html-language-declarations).
- [MDN: Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules).

This is Modern Objectivity's own design requirement; it is not a claim that EU language policy legally obliges every application to implement these languages.
