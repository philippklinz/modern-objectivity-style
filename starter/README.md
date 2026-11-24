# Modern Objectivity — Copyable Lab Starter

This folder is a **complete static HTML lab starter**.

[MO-13](../docs/10-multilingual-access.md) requires complete journeys in all 24 official EU languages, including this dashboard and its published instructions. Preserve that coverage when adapting the starter. The [copyable multilingual pattern](../patterns/i18n/) and its [programming guide](../guides/multilingual-pattern.md) explain source messages, formatting and state-preserving switches. Translations are AI-assisted and await independent language review.

## Files

- `index.html` — a usable laboratory dashboard with navigation, controls, synthetic data, table, search, empty state and CSV export.
- `modern-objectivity.css` — the full practical style system, included locally so this folder works on its own.
- `demo.js` — optional helper for the light/dark theme and sample notifications.

## Use in a new project

Copy this **entire folder** to your own laboratory project, then rename it and change its contents. No package manager or build system is required.

```sh
cp -r starter ../my-science-lab
cd ../my-science-lab
python3 -m http.server 8000
```

Open `http://localhost:8000/`. You can also open `index.html` directly in a browser.

## First changes

1. Replace "Laboratory zero", the descriptions and the sample table columns with your actual lab subject.
2. Replace `simulateObservation(index)` with your real data source. The current numbers are **demonstrations, not measurements**.
3. Update stage-specific CSS tokens inside `:root` and `[data-theme="dark"]`.
4. Preserve sensible focus behavior, data provenance, semantic states, keyboard interaction and accessible labels.
5. Add loading, failed requests, permissions and other states when integrating a backend.
6. Reconcile all 24 language editions after changing source text, including navigation, documentation, dynamic feedback and accessible descriptions. Verify coverage and source freshness separately from linguistic review.

## CSS components available

`mo-shell`, `mo-sidebar`, `mo-main`, `mo-topbar`, `mo-content`, `mo-section`, `mo-grid`, `mo-card`, `mo-panel`, `mo-stat`, `mo-btn`, `mo-input`, `mo-select`, `mo-table`, `mo-badge`, `mo-note`, `mo-progress`, `mo-tabs`, `mo-chart`, `mo-range`, `mo-code`.

Reference: [Visual style specification](../guides/visual-style-spec.md).

## License

GNU General Public License version 2 only, [GPL-2.0-only](../LICENSE). Check the license conditions when copying or distributing this starter.
