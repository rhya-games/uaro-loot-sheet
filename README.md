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

## Project layout

```
src/
  config.js           Site links (GitHub, Discord) and the per-row actions (Report)
  data/loot.json      All items (edit this to update the sheet)
  data/schema.json    Rules for what an item looks like
  data/changelog.js   Changelog entries (template at the top)
  pages/              Loot Sheet, About, Feedback, Contribute, Changelog
  components/         UI pieces (SearchBar, FilterSidebar, ItemTable, ItemCard, ...)
  utils/              Search, filters, sorting, page switching, labels/colors, formatting
scripts/              Data import and validation tools
.github/              Data check on every PR, and the item report form
```

Want to help? See [CONTRIBUTING.md](CONTRIBUTING.md). Found a mistake? Use **Report** at the end of any item's row, or see the site's Feedback page.
