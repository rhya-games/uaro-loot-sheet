# Contributing

Thanks for helping keep the loot sheet accurate! Most contributions are **data edits**: all items live in one file, and you don't need to know how to code to change it.

## Ways to help

- **Check prices in game** and update Vend, Whobuy, and the Verified date.
- **Fill in gaps**: items with no action, missing item IDs, or uses that aren't listed yet.
- **Report problems** if you'd rather not edit anything yourself: click the flag (Report Issue) at the end of any item's row on the site, or see the site's **Feedback** page.

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
  "verificationNotes": "Checked NPC price with Overcharge 10"
}
```

| Field | What it means |
| --- | --- |
| `id` | Unique key: the name in lowercase with dashes (`Cap [1]` → `cap-1`). |
| `name` | Item name as shown in the game. |
| `itemId` | The game's numeric item ID, or `null` if unknown. |
| `itemType` | `Consumable`, `Equipment`, or `Misc`. |
| `actions` | What to do with it: `Keep`, `Vend`, `Whobuy`, `NPC`. |
| `categories` | What it's used for. See the allowed list in [`schema.json`](src/data/schema.json). |
| `uses` | What it's needed for and how many: `{ "for": "Mystic Rose", "qty": 10 }`. Optional `"note"`, e.g. `"each try"`. |
| `notes` | Anything else, e.g. `Isis Taming Item` or `+10 DEX Food`. |
| `links` | Helpful links (`label` + `url`). Can be empty: `[]`. |
| `avgVend` | Average vending price in zeny, or `null` if unknown. |
| `avgWhobuy` | Average @whobuy price in zeny, or `null` if unknown. |
| `sellValue` | Zeny an NPC pays for one **before** Overcharge (the site adds the Overcharge bonus). Filled in from Hercules; only edit it for items Hercules doesn't have. |
| `npcBuyable` | `"yes"`, `"no"`, `"npc-only"`, or `null` if unknown. |
| `lastVerified` | Date you checked it on the live server (`YYYY-MM-DD`), or `null`. |
| `verificationNotes` | How it was checked. |

## Rules the automatic check enforces

- Numbers have no commas or quotes: `15500`, not `"15,500"`. Unknown values are `null`.
- If an NPC sells the item (`npcBuyable` is `"yes"` or `"npc-only"`), use `NPC` instead of `Vend` or `Whobuy`.
- Cards can't be bought from NPCs (`npcBuyable` is always `"no"`).
- Every item needs at least one category. Use `["Uncategorized"]` if none fit.
- Spell each `uses` target (`for`) the same way on every item, so the "Used For" filter groups them.
- Dates are `YYYY-MM-DD`.

**Tips**
- Every entry except the last one ends with a comma after its `}`.
- Keep items in A–Z order by `name`.
- When you confirm something in game, update `lastVerified` to today's date.

## Working on your computer

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev        # run the site at http://localhost:5173/uaro-loot-sheet/
npm run validate   # check loot.json for mistakes
```

`validate` lists any **errors** (must fix) and **warnings** (worth a look).

## Syncing with Hercules

Base sell prices and the Overcharge bonus come from the [Hercules emulator](https://github.com/HerculesWS/Hercules) (pre-renewal):

```bash
npm run sync:hercules            # update loot.json and game-rules.json
npm run sync:hercules -- --check # only list differences
```

## Changelog

When you make a noticeable change, add an entry at the top of [`src/data/changelog.js`](src/data/changelog.js). There's a copy-and-paste template at the top of that file.

## Wording

When referring to the original game, use **"Official"** (e.g. "Official Hat Quest") or **"Game"**. Please don't use other names for it anywhere in the repo.

## Questions

Post in the Discord feedback thread linked on the site's **Feedback** page.
