---
name: record-npc-shop
description: Record a uaRO NPC shop from in-game screenshots or the wiki's Dealers page into npcShops.uaroShops, then update which items NPCs sell. Use when the maintainer shares screenshots of an NPC shop window ("Shop Items") or names a dealer.
---

# Record a uaRO NPC shop

Read AGENTS.md first. Shops live in `src/data/uaro-overrides.json` →
`npcShops.uaroShops.shops`, and `npm run sync:shops` turns them into
`npcBuyable` in loot.json.

## 1. Read the screenshots

- Each row is an item name and a price. **"150 -> 133 Z" means normal
  price -> Discount skill price; record the first number.**
- Screenshots of one shop overlap; list each item once.
- Names wrap across lines in the game window ("Sharp Leaf Shu / riken").
- If the maintainer didn't say which NPC it is, ask. Also check
  https://wiki.uaro.net/Dealers/ (in the browser) for the shop's name,
  location and full list. The screenshots may only show part of the shop.

## 2. Find each item's ID

Look up every name in Hercules pre-renewal first, then rAthena renewal:

```js
import { loadPreRenewalItemDb } from './scripts/hercules.mjs';
import { loadRenewalItemDb } from './scripts/rathena.mjs';
```

- **Several IDs with the same name** (slotted weapons, "_C" variants):
  pick the one whose emulator `Buy` price equals the shop price.
- **The wiki gives IDs, but check them**: it has had typos (1711 for 1771,
  13299 for 13229). Note each correction in the entry's `note`.
- **The game and the emulators name it differently**: use the in-game name
  and add a `note`.
- **Not in either emulator**: keep the wiki's ID and note it's a uaRO item.
- If the item is in loot.json, the entry's `name` must match loot.json
  exactly (validate checks this).

## 3. Write the shop

```json
{
  "name": "Tool Dealer",
  "location": "Every inn",
  "checked": "YYYY-MM-DD",
  "source": "In-game screenshots and https://wiki.uaro.net/Dealers/",
  "items": [{ "itemId": 501, "name": "Red Potion", "price": 50 }]
}
```

- **Updating a shop that's already there**: merge the new data into it,
  don't add a second entry.
- **An item that's no longer sold** (the maintainer says so): add it to
  `npcShops.notSoldByNpc` with a note.
- **An item now proven by a real shop**: remove it from `soldByNpc`.

## 4. Sync and check

```bash
npm run sync:shops -- --check   # read the changes first
npm run sync:shops
npm run validate
```

Items that become NPC-sold get the NPC action instead of Vend/Whobuy, and
lose their player prices. Tell the maintainer about each one, because it
changes what the site advises.

## 5. Finish

- Add a line to `src/data/changelog.js` if a visitor would notice anything
  (for example, an item now showing ✓ in NPC Shop).
- Commit.
- Report: the shop and how many items, what changed on the site, and
  anything uncertain (guessed IDs, prices that don't match either emulator).
