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
npm run build          # validate + production build
npm run sync:prices    # NPC sell prices + Overcharge % from the emulators
npm run sync:shops     # npcBuyable from emulator shops + uaRO's own shops
```

Both sync scripts take `-- --check` to report without writing. They
download emulator files once into `scripts/.cache/` (gitignored). Run
`npm run validate` after any data change; errors must be 0. There are no
unit tests or formatter yet.

## Data model

- `src/data/loot.json`: the items, sorted A-Z by `name`. The shape is in
  `src/data/schema.json`; see CONTRIBUTING.md for each field.
- `src/data/uaro-overrides.json`: everything where uaRO differs from the
  emulators. Hand-edited. Edit this instead of hard-coding exceptions.
  - `modifiedSellPrices`: fixed NPC prices (the wiki's list); Overcharge
    doesn't apply.
  - `customSellValues`: base prices checked by hand, including confirmed 0z.
  - `notSellableToNpc`: shown as ✕.
  - `npcShops`: `uaroShops` (shops checked in game or on the wiki, with
    prices), `soldByNpc`, `notSoldByNpc`, and `renewalShops`.
  - `renewalContent`: uaRO's renewal areas, and renewal price differences
    already reviewed (`reviewedPrices`).
- `src/data/game-rules.json`: Overcharge level and %; generated.
- `src/data/changelog.js`: the site's Changelog page. Add a line for
  anything a visitor would notice.

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

- "Used For" targets reuse an existing name exactly. Pet evolutions are
  `"<Evolved pet> Pet Evolution"`. Uses show quantities from the wiki.
- Pet evolution materials: `Keep` + `Vend`, categories `Pet Evolution`,
  `Pet`, `uaRO`. Cards add `Card`.
- Taming items: `Vend`, category `Pet`, notes `"<Pet> Taming Item"`.
- Pet accessories: `NPC`, category `Pet`, notes `"<Pet> Pet accessory"`.
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

## Code

- Vite + React 19 + Tailwind v4. No router library: hash routes in
  `src/utils/route.js`. No state library.
- Floating UI (`@floating-ui/react-dom`) positions tooltips, menus and
  popovers in portals so scroll boxes can't clip them.
- Performance matters: the table has 600+ rows. `ItemList` and
  `FilterSidebar` are `memo`'d, so pass them stable props (`useCallback`,
  stable arrays). Only the table or the cards are drawn, never both. The
  filter panel stays mounted (`inert` when closed) and the table slides
  with a FLIP animation.
- Write code that reads like the code around it: plain names, a comment
  explaining *why* above anything non-obvious, and JSDoc-style prop lists
  on components.

### UI conventions

- Colors are theme tokens in `src/index.css` (`text-fg`, `text-body`,
  `text-muted`, `bg-surface`, `bg-hover`, `border-line`, ...) with light and
  dark values. Don't use raw grays.
- Reuse the utilities: `panel` (cards and popovers), `button-small`
  (secondary buttons like "Clear all").
- Type: headings are `font-semibold`, body `text-sm`, secondary `text-xs`
  or `text-sm text-muted`. No all-caps, letter-spacing or italics.
- Every interactive element gets a visible focus ring (rounded). Tooltips
  use `components/Tooltip.jsx` (hover with a delay, and keyboard focus).
  Only use one when the element has no visible label.
- Escape closes the innermost thing first. Components that handle Escape
  call `event.preventDefault()`, and the filter panel ignores handled keys.
- Respect `prefers-reduced-motion` (see `utils/usePresence.js`).
- Check changes at desktop (≥1470px, where the panel pushes the table),
  tablet (768–1469px, the panel overlaps it) and phone (<768px, cards and a
  full-screen panel), in light and dark mode.

## Writing style

The site, docs and data notes are read by players, many of them not native
English speakers. Use short, plain sentences and everyday words. Say
"Official" or "the game", never the original's name (see Hard rules).

## Git

- Work on a feature branch, never commit to `main`, and merge through a PR.
  CI runs `validate` on PRs, and merging to `main` deploys to GitHub Pages.
- Commit in small steps with messages that say what changed and why.
- Don't push, open PRs, merge or deploy unless the maintainer asks.
