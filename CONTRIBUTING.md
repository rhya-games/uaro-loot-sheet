# Contributing

Thanks for helping keep the loot sheet accurate! Most contributions are **data edits**, and you don't need to know how to code to make one.

## Editing item data

All items live in one file: [`src/data/loot.json`](src/data/loot.json). Each item looks like this:

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
  "npcSellPrice": 15500,
  "npcBuyable": "no",
  "lastVerified": "2026-09-22",
  "verificationNotes": "Checked NPC price with Overcharge 10"
}
```

| Field | What it means |
| --- | --- |
| `id` | Unique key: the name in lowercase with dashes (`Cap [1]` → `cap-1`). |
| `name` | Item name as shown in the game. |
| `itemId` | The game's numeric item ID, or `null` if unknown. |
| `itemType` | `Consumable`, `Equipment`, or `Misc`. |
| `actions` | What to do with it. Allowed: `Keep`, `Vend`, `Whobuy`, `NPC`. If NPCs sell the item (`npcBuyable` is `"yes"` or `"npc-only"`), use `NPC` instead of `Vend` or `Whobuy`. |
| `categories` | What it's used for. See the allowed list in [`schema.json`](src/data/schema.json). Use `["Uncategorized"]` if none fit. |
| `uses` | What it's needed for and how many: `{ "for": "Mystic Rose", "qty": 10 }`. Use `"qty": null` if it varies. Spell `for` exactly the same on every item, so the "Used For" filter groups them together. |
| `notes` | Anything else, e.g. `Isis Taming Item` or `+10 DEX Food`. |
| `links` | Helpful links (`label` + `url`). Can be empty: `[]`. |
| `avgVend` | Average vending price in zeny, or `null` if unknown. |
| `avgWhobuy` | Average @whobuy price in zeny, or `null` if unknown. |
| `npcSellPrice` | Zeny from selling to an NPC with Overcharge 10, or `null`. |
| `npcBuyable` | `"yes"`, `"no"`, `"npc-only"`, or `null` if unknown. Always `"no"` for cards. |
| `lastVerified` | Date you checked it on the live server (`YYYY-MM-DD`), or `null`. |
| `verificationNotes` | How it was checked. |

**Tips**
- Numbers have no commas or quotes: `15500`, not `"15,500"`.
- Every entry except the last one ends with a comma after its `}`.
- Keep items in A–Z order by `name`.
- When you confirm something in game, update `lastVerified` to today's date.

### Easiest way (in the browser)
1. Open `src/data/loot.json` on GitHub and click the pencil icon.
2. Make your change.
3. Click **Commit changes** → **Create a pull request**. The data is checked automatically.

### On your computer
```bash
npm install
npm run validate
```
`validate` lists any **errors** (must fix) and **warnings** (worth a look).

## Wording
When referring to the original game, use **"Official"** (e.g. "Official Hat Quest") or **"Game"**. Please don't use other names for it anywhere in the repo.
