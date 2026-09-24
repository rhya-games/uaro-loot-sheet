---
name: update-vend-prices
description: Update avgVend / avgWhobuy prices in the loot sheet from vending stall or @whobuy screenshots or a list of prices, and mark them verified today. Use when the maintainer shares vend/whobuy prices or a vending shop screenshot.
---

# Update vend or @whobuy prices

Read AGENTS.md first.

## 1. Read the prices

- A vending stall ("Opening a stall") shows each item's name, amount and
  **Price**. Use the Price (the price for one item), not the amount.
- Ask whether the prices are vend prices (`avgVend`) or @whobuy prices
  (`avgWhobuy`) if it isn't clear. A stall is vend.
- Names wrap across lines ("Expanded Token F / ragment"), and the game may
  spell them differently from the sheet ("Valhala's Flower" vs "Valhalla's
  Flower"). Match loosely, but confirm anything uncertain.

## 2. Update items that are in the sheet

For each item, in `src/data/loot.json`:

- Set `avgVend` (or `avgWhobuy`) to the price.
- Set `lastVerified` to today (`YYYY-MM-DD`).
- Set `verificationNotes` to where the price came from, for example
  `"Vend price from a player shop"`.

**Items NPCs sell** (`npcBuyable` "yes" or "npc-only") can't have player
prices; validate fails if they do. Tell the maintainer instead of setting it.

## 3. Items that aren't in the sheet

List them and ask what to do. For each one you add, the maintainer gives
(or you ask for) the action and category. Then:

- Find the item ID: Hercules pre-renewal first, then rAthena renewal. Equipment
  names include slots, like `"Hatii Claw [1]"`.
- Set `itemType` from the emulator (Consumable / Equipment / Misc).
- Fill every field (copy the shape of an existing item), with the new price
  and `lastVerified` as above.
- Keep loot.json sorted by name.

## 4. Sync and check

```bash
npm run sync:prices && npm run sync:shops && npm run validate
```

New items get their NPC price and NPC Shop value from the syncs. A new
item that sells to NPCs for 0z makes validate warn; ask whether it really
is 0z (add it to `customSellValues`), can't be sold (`notSellableToNpc`),
or has a price.

## 5. Finish

- Add a changelog line (`src/data/changelog.js`) naming the updated and
  added items.
- Commit.
- Report the prices you set, the items you added, and the questions.
