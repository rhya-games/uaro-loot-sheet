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
  data/loot.json      All items (edit this to update the sheet)
  data/schema.json    Rules for what an item looks like
  components/         UI pieces (SearchBar, FilterSidebar, ActiveFilters, ItemTable, ItemCard, ...)
  utils/              Search, filters, labels/colors, number formatting
scripts/              Data import and validation tools
```

Want to help? See [CONTRIBUTING.md](CONTRIBUTING.md).
