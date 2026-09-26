---
name: add-items
description: Add items that are missing from the loot sheet (from prices, a wiki table, an NPC shop, a monster or quest list): find the item ID, fill every field, pick categories and actions, and run the syncs. Use whenever an item needs to be added to src/data/loot.json.
---

# Add items to the sheet

Read AGENTS.md first (hard rules, and "Conventions when adding items").

The sheet includes every item a player can hold: dropped, sold by NPCs or
crafted. Add missing items; don't skip one because it looks unimportant. If
something really seems out of scope, list it with the reason and ask.

## 1. Find the item

- Look in `src/data/loot.json` first, loosely: the game may spell it
  differently ("Valhala's Flower"), and equipment has slots in its name
  (`"Celebrant's Mitten [0]"`).
- Look up the ID in Hercules pre-renewal first, then rAthena renewal:

```js
import { loadPreRenewalItemDb } from './scripts/hercules.mjs';
import { loadRenewalItemDb } from './scripts/rathena.mjs';
const hits = [...(await loadPreRenewalItemDb()).values()].filter((i) => i.name?.includes('Poring Box'));
```

- Use uaRO's in-game name. If the emulators name it differently, put their
  name in `notes`. If it's in neither emulator, use the wiki's ID (check it:
  the wiki has typos) and say it's a uaRO item in `notes`.
- Several IDs with the same name (slotted weapons, costume or "_C"
  versions): pick the one whose `Buy` price fits, and mention the doubt.

## 2. Fill every field

Copy the shape of a similar item (`Dead Branch (DB)` for a consumable;
CONTRIBUTING.md lists the fields).

- `id`: the name in lowercase with dashes (`"Cap [1]"` -> `"cap-1"`), unique.
- `itemType`: from the emulator. `IT_HEALING`, `IT_USABLE`, `IT_DELAYCONSUME`
  and `IT_CASH` are `Consumable`; `IT_WEAPON`, `IT_ARMOR` and `IT_AMMO` are
  `Equipment`; anything else is `Misc`.
- `sellValue` and `sellSource`: the emulator's price (`Sell`, or `Buy` / 2)
  and `hercules` or `rathena-renewal`. `npm run sync:prices` checks them.
- `npcBuyable`: `"no"` for now. `npm run sync:shops` corrects it.
- `avgVend` / `avgWhobuy` / `lastVerified` / `verificationNotes`: only what
  the maintainer checked in game (`null` and `""` otherwise).
- `links` and `notes`: empty unless there's something worth saying. Notes
  are short and plain, with no "dropped by" and no period on a fragment.

## 3. Categories and actions

- **Categories:** if it has uses, give it the matching ones and list the
  uses. If nothing uses it, `["No Use"]` (it can't have uses or other
  categories). All known uses are already mapped, so that's the default.
  `["Not Reviewed"]` only when the maintainer says it hasn't been checked:
  the published site hides those items.
- **Actions:** from its prices (`createSuggester` in `src/utils/suggest.js`;
  see `update-vend-prices` step 4). With no player price yet, use the
  pattern of similar items: cards are always Vend, pet evolution materials
  `Keep` + `Vend`, taming items `Vend`. Cards and equipment have no @whobuy.
- New uses on other items: reuse the target's name exactly, and run
  `npm run sync:targets` so it gets an item ID for the Targets page.

## 4. Sort, sync and check

- Keep `loot.json` sorted by `name` (`localeCompare`).
- Run `npm run sync:prices && npm run sync:shops && npm run validate`.
  Fix every error. A new item that sells to NPCs for 0z makes validate
  warn: ask whether it really is 0z (`customSellValues`), can't be sold
  (`notSellableToNpc`), or has a price.
- If the CSV import should give the same result, mirror renames and IDs in
  `scripts/source/sheet-corrections.mjs`.

## 5. Finish

Add a line to today's changelog card, commit, and report what you added,
with each item's ID, categories and actions, and anything you guessed.
