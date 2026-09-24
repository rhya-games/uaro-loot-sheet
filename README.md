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
| `npm run build` | Validates the data, then builds the public site into `dist/`. |

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
  pages/              Loot Sheet, About, Feedback, Changelog
  components/         UI pieces (SearchBar, FilterSidebar, ItemTable, ItemCard, ...)
  utils/              Search, filters, sorting, page switching, labels/colors, formatting
scripts/              Data import and validation tools
.github/              Data check on every PR, and the item report form
```

Want to help? See [CONTRIBUTING.md](CONTRIBUTING.md). Found a mistake? Click the flag (Report Issue) at the end of any item's row, or see the site's Feedback page.
