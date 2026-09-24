# Contributing

Thanks for helping keep the loot sheet accurate! Most contributions are **data edits**: all items live in one file, and you don't need to know how to code to change it.

## Ways to help

- **Check prices in game** and update Vend, Whobuy, and the Verified date.
- **Fill in gaps**: items with no action, missing item IDs, or uses that aren't listed yet.
- **Report problems** if you'd rather not edit anything yourself: point at an item's row on the site and click the flag (Report Issue) in the Verified column, or see the site's **Feedback** page.

## Edit the data on GitHub (no coding needed)

You only need a free GitHub account.

1. Open [`src/data/loot.json`](src/data/loot.json) and click the pencil icon (**Edit**).
2. Find the item (Ctrl+F / Cmd+F) and change what you need.
3. Click **Commit changes**, describe what you changed, and choose **Create a pull request**.
4. Your change is checked automatically. If something's wrong, the check explains what to fix.

## What an item looks like

```json
{
  "id": "2carat-diamond",
  "name": "2carat Diamond",
  "itemId": 731,
  "itemType": "Misc",
  "actions": ["NPC", "Keep"],
  "categories": ["Official Hat Quest"],
  "uses": [{ "for": "Mystic Rose", "qty": 10 }],
  "notes": "",
  "links": [{ "label": "Mystic Rose", "url": "https://wiki.uaro.net/..." }],
  "avgVend": null,
  "avgWhobuy": null,
  "sellValue": 12500,
  "npcBuyable": "no",
  "lastVerified": "2026-09-23",
  "verificationNotes": "Checked vending shops"
}
```

| Field | What it means |
| --- | --- |
| `id` | Unique key: the name in lowercase with dashes (`Cap [1]` → `cap-1`). |
| `name` | Item name as shown in the game. |
| `itemId` | The game's numeric item ID, or `null` if unknown. |
| `itemType` | `Consumable`, `Equipment`, or `Misc`. |
| `actions` | What to do with it: `Keep`, `Vend`, `Whobuy`, `NPC`, or `Junk` (throw it away: nothing uses it and nobody pays for it). |
| `categories` | What it's used for. See the allowed list in [`schema.json`](src/data/schema.json). |
| `uses` | What it's needed for and how many: `{ "for": "Mystic Rose", "qty": 10 }`. Optional `"note"`, e.g. `"each try"`. |
| `notes` | Anything else about what the item does, e.g. `Isis Taming Item` or `+4 INT for 20 minutes`. It shows under "Used For", so leave out who drops it, and skip the period unless there are several sentences. |
| `links` | Helpful links (`label` + `url`). Can be empty: `[]`. |
| `avgVend` | Average vending price in zeny, or `null` if unknown. |
| `avgWhobuy` | Average @whobuy price in zeny, or `null` if unknown. |
| `sellValue` | Zeny an NPC pays for one **before** Overcharge (the site adds the Overcharge bonus). Filled in by `npm run sync:prices`; only edit it for items neither emulator has. |
| `sellSource` | Where `sellValue` came from: `hercules`, `rathena-renewal`, or `manual`. Set by the sync. |
| `npcBuyable` | `"yes"`, `"no"`, `"npc-only"`, or `null` if unknown. Filled in by `npm run sync:shops`. |
| `lastVerified` | Date you last checked its **vend or @whobuy price** on the live server (`YYYY-MM-DD`), or `null`. |
| `verificationNotes` | How it was checked. |

## Rules the automatic check enforces

- Numbers have no commas or quotes: `15500`, not `"15,500"`. Unknown values are `null`.
- If an NPC sells the item (`npcBuyable` is `"yes"` or `"npc-only"`), use `NPC` instead of `Vend` or `Whobuy`, and leave `avgVend` and `avgWhobuy` as `null` (the site shows ✕).
- Cards can't be bought from NPCs (`npcBuyable` is always `"no"`).
- Every item needs at least one category. Use `["Uncategorized"]` if none fit.
- Spell each `uses` target (`for`) the same way on every item, so the "Used For" filter groups them.
- Dates are `YYYY-MM-DD`.

**Tips**
- Every entry except the last one ends with a comma after its `}`.
- Keep items in A–Z order by `name`.
- When you check an item's vend or @whobuy price in game, update `lastVerified` to today's date. NPC prices come from the emulators and don't change, so updating those doesn't count.

## Working on your computer

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev        # run the site at http://localhost:5173/uaro-loot-sheet/
npm run validate   # check loot.json for mistakes
```

`validate` lists any **errors** (must fix) and **warnings** (worth a look).

## NPC sell prices

uaRO is a pre-renewal server, so prices follow the [Hercules emulator](https://github.com/HerculesWS/Hercules)'s pre-renewal data. Renewal items uaRO added (that Hercules doesn't price) use [rAthena](https://github.com/rathena/rathena)'s renewal data. The Overcharge bonus is read from Hercules' code.

```bash
npm run sync:prices            # update loot.json and game-rules.json
npm run sync:prices -- --check # only list differences
```

### uaRO's own changes: `src/data/uaro-overrides.json`

Edit this file (not loot.json) when uaRO differs from the emulators:

- **`modifiedSellPrices`**: prices uaRO lowered ([wiki](https://wiki.uaro.net/Modified_Sales_Prices/)). The most an NPC pays; Overcharge doesn't raise it.
- **`customSellValues`**: a base price checked by hand, when the emulators are wrong or unsure. Also use it to confirm an item really sells for 0z. Overcharge still applies.
- **`notSellableToNpc`**: items NPCs won't buy on purpose (currencies, event coins). Shown as ✕.
- **`tradeRestrictions`**: `notTradeable` lists items players can't trade (Vend and Whobuy show ✕). The emulators flag many items as bound that uaRO lets you trade, so their flags are only a reminder: `npm run sync:prices` lists flagged items until they're added to `checked`.
- **`renewalContent`**: renewal areas uaRO added. Their drops are **not** added automatically; the sync only lists items from these areas whose renewal price differs, for review. The pre-renewal price wins; once reviewed, add the item to `reviewedPrices` so the sync stops listing it.

- **`npcShops`**: which items you can buy from NPCs (see below).

Each entry needs the item's `itemId` and `name` exactly as in loot.json; `npm run validate` checks this.

## Items sold by NPCs

`npcBuyable` comes from the NPC shops in Hercules' pre-renewal scripts, plus the renewal shops uaRO added (read from rAthena, listed under `npcShops.renewalShops`). Items not in any zeny shop are `"no"`.

```bash
npm run sync:shops            # update npcBuyable in loot.json
npm run sync:shops -- --check # only list differences
```

When an item turns out to be sold by NPCs, the sync changes its Vend/Whobuy actions to NPC and clears its player prices, and lists every change. Shops checked in game go in `npcShops.uaroShops` (shop name, date checked, and each item's ID, name and normal price). Anything else uaRO sells that the emulators don't goes in `npcShops.soldByNpc`, and anything it doesn't sell goes in `notSoldByNpc`.

## Changelog

When you make a noticeable change, add an entry at the top of [`src/data/changelog.js`](src/data/changelog.js). There's a copy-and-paste template at the top of that file.

## Wording

When referring to the original game, use **"Official"** (e.g. "Official Hat Quest") or **"Game"**. Please don't use other names for it anywhere in the repo.

## Questions

Post in the Discord feedback thread linked on the site's **Feedback** page.
