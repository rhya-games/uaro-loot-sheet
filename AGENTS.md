# AGENTS.md

Context for AI coding agents working on this repo. People should start with
[README.md](README.md) (running and deploying) and
[CONTRIBUTING.md](CONTRIBUTING.md) (the data format and rules). This file
covers what those don't: the project's hard rules, how the data pipeline
fits together, and the conventions to follow.

## What this is

A loot tracker for **uaRO**, a private game server. It's a static React
site (GitHub Pages) that shows every loot item with what to do with it
(Keep, Vend, Whobuy, NPC), what it's used for, and its prices. The data
is JSON in the repo, so people who don't code can edit it.

## Hard rules

- **Never name the original game or its regional official servers** in
  anything in the repo (code, comments, docs, data, commit messages). Say
  "Official" for the original, or "the game" in general. The GitHub org
  name in URLs is the one exception.
- **Keep the maintainer's usernames out of any copy** (site text, docs,
  data). "Rhya" as the site owner's name is fine. Git history is fine.
- uaRO is **pre-renewal**. Pre-renewal data is the default; renewal
  content only counts where uaRO added it (see
  `renewalContent` in `src/data/uaro-overrides.json`). Never add drops
  from renewal areas automatically.
- Use **uaRO's in-game item names** (for example "Cotton Wads", "Miracle
  Bandage", "Ghost Coffin"), even when the emulators name the item
  differently. Put the emulator name in the item's `notes` if it helps.

## Commands

```bash
npm run dev            # local site at http://localhost:5173/uaro-loot-sheet/
npm run validate       # check the data (CI runs this; build runs it first)
npm run lint           # code checks (ESLint; CI runs this)
npm test               # unit tests in src/**/*.test.js (Vitest; CI runs this)
npm run build          # validate + production build
npm run sync:prices    # NPC sell prices + Overcharge % from the emulators
npm run sync:shops     # npcBuyable from emulator shops + uaRO's own shops
npm run check:uses -- recipes.json   # compare recipes (e.g. a wiki table) with "Used For"
npm run suggest [-- "name"]          # compare suggested actions (src/utils/suggest.js) with hand-set ones
```

Both sync scripts take `-- --check` to report without writing. They
download emulator files once into `scripts/.cache/` (gitignored). Run
`npm run validate` after any data change; errors must be 0. Run `npm run
lint` and `npm test` after code changes. There's no formatter yet.

## Data model

- `src/data/loot.json`: the items, sorted A-Z by `name`. The shape is in
  `src/data/schema.json`; see CONTRIBUTING.md for each field.
- `src/data/uaro-overrides.json`: everything where uaRO differs from the
  emulators. Hand-edited. Edit this instead of hard-coding exceptions.
  - `modifiedSellPrices`: fixed NPC prices (the wiki's list); Overcharge
    doesn't apply.
  - `customSellValues`: base prices checked by hand, including confirmed 0z.
  - `notSellableToNpc`: shown as ✕.
  - `tradeRestrictions`: `notTradeable` (✕ in Vend/Whobuy) and `checked`
    (emulator trade flags confirmed on uaRO). Don't trust the emulators'
    Trade flags: every one checked so far was wrong for uaRO.
  - `npcShops`: `uaroShops` (shops checked in game or on the wiki, with
    prices), `soldByNpc`, `notSoldByNpc`, and `renewalShops`.
  - `renewalContent`: uaRO's renewal areas, and renewal price differences
    already reviewed (`reviewedPrices`).
- `src/data/game-rules.json`: Overcharge level and %; generated.
- `src/data/changelog.js`: the site's Changelog page. Add a line for
  anything a visitor would notice. One entry per day, each with a version
  (SemVer, 0.x until 1.0; features raise the middle number, fixes the last)
  that matches `package.json`. Merging to main publishes a GitHub release.

### Where values come from (most important first)

- **NPC sell price:** uaRO overrides, then Hercules pre-renewal (if it has
  a Buy or Sell), then rAthena renewal, then Hercules at 0, then a manual
  value. The site adds Overcharge 10 (+24%) unless the price is a
  `modifiedSellPrices` one.
- **npcBuyable:** `notSoldByNpc`, then `uaroShops` and `soldByNpc`, then
  Hercules pre-renewal zeny shops, then rAthena shops listed in
  `renewalShops`, and otherwise "no".
- **Item type:** Hercules.

### Data rules (enforced by `npm run validate`)

- Items NPCs sell (`npcBuyable` "yes" or "npc-only") use the `NPC` action,
  never `Vend`/`Whobuy`, and have `avgVend`/`avgWhobuy` set to null (the
  site shows ✕).
- Cards always have `npcBuyable: "no"`.
- Every entry in `uaro-overrides.json` must match an item's `itemId` and
  `name` in loot.json when that item is listed there.
- `lastVerified` means the vend or @whobuy price was checked in game.
  Setting an NPC price doesn't count.

### Conventions when adding items

Match similar existing items. Look them up in loot.json first.

- **What belongs in the sheet:** any item a player can end up holding:
  dropped, sold by NPCs (the sheet tells people not to vend those) or
  crafted (crafted items can be sold too). Default to including. Before
  leaving anything out, explain why and get the maintainer's OK.

- New items start with the category `Not Reviewed`. Once their uses are
  checked (uaRO wiki, emulator quest scripts: items taken with `delitem`),
  they get real categories, or `No Use` if nothing uses them.
- "Used For" targets reuse an existing name exactly. Pet evolutions are
  `"<Evolved pet> Pet Evolution"`. Uses show quantities from the wiki.
- Pet evolution materials: `Keep` + `Vend`, categories `Pet Evolution`,
  `Pet`, `uaRO`. Cards add `Card`.
- Taming items: `Vend`, category `Pet`, notes `"<Pet> Taming Item"`.
- Pet accessories (IDs 10001-10038): item type `Equipment` (so no
  @whobuy), category `Pet`, notes `"<Pet> Pet accessory"` with the uaRO pet
  name. Junk when worth under 5,000z and nothing else uses them; otherwise
  by price like anything else.
- Headgear quest materials (Dimonka): category `Server Hat Quest` + `uaRO`.
- After adding items: run `sync:prices`, `sync:shops`, then `validate`.
- If the CSV import should produce the same result, mirror renames, IDs
  and removals in `scripts/source/sheet-corrections.mjs`.

## Sources

- **uaRO wiki** (wiki.uaro.net) is the authority for uaRO changes:
  modified prices, dealers, headgear quests, the pet system. It blocks
  plain `curl`; read it in a real browser. Its item IDs sometimes have
  typos, so check each against the emulators and note the fix.
- **Hercules** (`HerculesWS/Hercules`, branch `stable`): pre-renewal items,
  shops, and the Overcharge formula (`src/map/pc.cpp`).
- **rAthena** (`rathena/rathena`, branch `master`): renewal items, monsters,
  spawns, shops and pets.
- **Divine Pride**: only for items that are in none of the above.
- In-game screenshots from the maintainer beat everything else.
- `research/uaro-monsters.json`: uaRO monsters transcribed from in-game
  `@mi` screenshots (stats and drop rates). uaRO changes renewal monsters'
  drops, so for these monsters this beats the emulators' monster data.
  Add new ones to `research/uaro-monsters-transcribed.mjs` and run
  `node research/build-monsters.mjs`. The site doesn't read this folder.

## Code

- Vite + React 19 + Tailwind v4. No router library: hash routes in
  `src/utils/route.js`. No state library. The loot page keeps its view
  (search, filters, sort) after a `?` in the hash (`src/utils/viewUrl.js`);
  new filter groups need adding there too so links carry them.
- Floating UI (`@floating-ui/react-dom`) positions tooltips, menus and
  popovers in portals so scroll boxes can't clip them.
- Performance matters: the table has 600+ rows. `ItemList` and
  `FilterSidebar` are `memo`'d, so pass them stable props (`useCallback`,
  stable arrays). Rows and cards are `memo`'d too, and only rows whose uses
  match get the highlight (`utils/highlight.js`). Long lists are drawn in
  batches (`utils/useProgressiveList.js`), and results follow the search box
  through `useDeferredValue`. Only the table or the cards are drawn, never both. The
  filter panel stays mounted (`inert` when closed) and the table slides
  with a FLIP animation.
- Write code that reads like the code around it: plain names, a comment
  explaining *why* above anything non-obvious, and JSDoc-style prop lists
  on components.

### UI conventions

- Colors are theme tokens in `src/index.css` (`text-fg`, `text-body`,
  `text-muted`, `bg-surface`, `bg-hover`, `border-line`, ...) with light and
  dark values. Don't use raw grays. Text uses only three grays: `fg`,
  `body`, `muted`. For anything quieter, lower the opacity.
- Icons: Heroicons outline only, line weight 2 (set once in `index.css`).
  `size-5` (20px) for icons on their own, `size-4` (16px) inside a line of text.
- Reuse the utilities: `panel` (cards and popovers), `button-small`
  (secondary buttons like "Clear all").
- Type: headings are `font-semibold`, body `text-sm`, secondary `text-xs`
  or `text-sm text-muted`. No all-caps, letter-spacing or italics.
- Every interactive element gets a visible focus ring (rounded, from
  `index.css`): a 2px ring with the gap filled by `--focus-gap` (set it where
  the background isn't the surface color), raised to z-20 so neighbors can't
  cover it. Overlays inside a focusable control (icons, clear buttons) need
  z-30. Checkboxes use the `checkbox` utility (white check). Tooltips
  use `components/Tooltip.jsx` (hover with a delay, and keyboard focus).
  Only use one when the element has no visible label.
- Escape closes the innermost thing first. Components that handle Escape
  call `event.preventDefault()`, and the filter panel ignores handled keys.
- Respect `prefers-reduced-motion` (see `utils/usePresence.js`).
- Check changes at desktop (≥1470px, where the panel pushes the table),
  tablet (768–1469px, the panel overlaps it) and phone (<768px, cards and a
  full-screen panel), in light and dark mode.

### Admin mode and suggested actions

- `src/utils/suggest.js` works out actions from prices (margins, Keep when
  a finished thing is worth more than its parts). `src/data/use-targets.json`
  holds values for "Used For" targets that aren't loot (set them on admin
  mode's Targets page, `#/targets`). Quests ("... Quest(s)") have no value
  and are always a reason to Keep. Uses noted "not used up" (Sign Quest
  weapons, recipe books) never are. Cards always suggest Vend; level 1-3
  cooking (use notes "+1".."+3 ... food", Level 1-3 Cookbook trades) is
  never a reason to Keep.
- Admin mode (`src/admin/`) only exists under `npm run dev`
  (`import.meta.env.DEV`). Saves POST to the Vite plugin in
  `scripts/admin-server.mjs`, which writes loot.json; only the fields in its
  `EDITABLE` list can change; target values go to use-targets.json. Saving
  a price or a target value also saves the new suggested actions (except
  for items with no player price yet). The page swaps in the saved item itself, and
  the plugin skips Vite's reload for its own writes.
- Site JSON imports use `with { type: 'json' }` so Node scripts can import
  the same utils.

## Recurring jobs

Step-by-step guides for the common data tasks are in `.claude/skills/`
(plain Markdown, usable by any agent):

- `check-wiki-page`: compare "Used For" data with a uaRO wiki table and fix it.
- `record-npc-shop`: record an NPC shop from screenshots or the wiki.
- `update-vend-prices`: set vend/@whobuy prices from screenshots.

## Writing style

The site, docs and data notes are read by players, many of them not native
English speakers. Use short, plain sentences and everyday words. Say
"Official" or "the game", never the original's name (see Hard rules).

## Git

- Work on a feature branch, never commit to `main`, and merge through a PR.
  CI runs `validate`, `lint` and `test` on PRs, and merging to `main`
  deploys to GitHub Pages and publishes a release.
- Commit in small steps with messages that say what changed and why.
- Don't push, open PRs, merge or deploy unless the maintainer asks.
