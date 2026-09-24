# uaro-loot-sheet
Rhya's uaRO Loot Sheet: quickly determine what to do with your loot.

## Running it locally

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:5173/uaro-loot-sheet/

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the site locally and reloads as you edit. |
| `npm run validate` | Checks `src/data/loot.json` for mistakes. |
| `npm run check:uses -- recipes.json` | Compares a list of recipes (for example, a quest table from the uaRO wiki) with the "Used For" data and lists the differences. |
| `npm run sync:shops` | Updates which items NPCs sell (Hercules pre-renewal shops, plus uaRO's renewal shops from rAthena). Add `-- --check` to only list differences. |
| `npm run sync:prices` | Updates NPC sell prices (Hercules pre-renewal, rAthena renewal for renewal-only items) and the Overcharge bonus. Add `-- --check` to only list differences. |
| `npm run suggest` | Compares the suggested actions (worked out from prices) with the ones set by hand. Add `-- "name"` to see why for matching items. |
| `npm run build` | Validates the data, then builds the public site into `dist/`. |

### Admin mode

While `npm run dev` is running, the header has an **Admin** button. Turn it
on to type vend and @whobuy prices straight into the table: press Enter (or
click away) to save to `src/data/loot.json`, which also marks the item as
verified today. Shorthand works: `12k`, `1.5m`. Escape puts the old price
back. Each item also shows the action suggested by its prices (hover it to
see why). Run `npm run validate` and commit as usual when you're done.

The published site has no server, so it never shows admin mode.

## Deploying

The site is published to GitHub Pages automatically by
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
on every push to `main`. It runs `npm run build` (which checks the data first),
so broken data is never published.

One-time setup on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

To check a production build locally before pushing:

```bash
npm run build
npm run preview
```

Then open http://localhost:4173/uaro-loot-sheet/

## Project layout

```
src/
  config.js           Site links (GitHub, Discord) and the per-row actions (Report Issue)
  index.css           Color roles for light/dark mode, screen sizes
  data/loot.json      All items (edit this to update the sheet)
  data/schema.json    Rules for what an item looks like
  data/changelog.js   Changelog entries (template at the top)
  data/uaro-overrides.json  Where uaRO differs from the emulators (prices, unsellable items, renewal areas)
  pages/              Loot Sheet, About, Feedback, Changelog
  components/         UI pieces (SearchBar, FilterSidebar, ItemTable, ItemCard, ...)
  utils/              Search, filters, sorting, page switching, labels/colors, formatting
scripts/              Data import and validation tools
.github/              Data check on every PR, and the item report form
```

Want to help? See [CONTRIBUTING.md](CONTRIBUTING.md). Found a mistake? Point at an item's row and click the flag (Report Issue) in the Verified column, or see the site's Feedback page.
