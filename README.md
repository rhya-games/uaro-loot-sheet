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
  config.js           Site links: GitHub repo, Discord, issue report links
  data/loot.json      All items (edit this to update the sheet)
  data/schema.json    Rules for what an item looks like
  pages/              LootPage (the item list) and AboutPage
  components/         UI pieces (SearchBar, FilterSidebar, ItemTable, ItemCard, ...)
  utils/              Search, filters, sorting, page switching, labels/colors, formatting
scripts/              Data import and validation tools
.github/              Data check on every PR, and the item report form
```

Want to help? See [CONTRIBUTING.md](CONTRIBUTING.md). Found a mistake? Use the **Report** link under any item on the site.
