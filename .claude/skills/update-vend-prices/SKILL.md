---
name: update-vend-prices
description: Update avgVend / avgWhobuy prices in the loot sheet from vending stall or @whobuy screenshots or a list of prices, add items that are missing, and mark everything verified today. Use when the maintainer shares vend/whobuy prices or a vending shop screenshot.
---

# Update vend or @whobuy prices

Read AGENTS.md first. For a lot of prices typed by hand, admin mode
(`npm run dev`, then the Admin button) is faster and does steps 2 and 4
for you. This guide is for prices the maintainer sends to you.

**Take the maintainer's prices as given.** Don't question a price, flag one
that dropped a lot, or ask if it might be a one-off. They checked it in game.

## 1. Read the prices

- A vending stall ("Opening a stall") shows each item's name, amount and
  **Price**. Use the Price (for one item), not the amount or the total.
- Prices with no label are vend prices (`avgVend`). Only an @whobuy list, or
  the maintainer saying so, makes them `avgWhobuy`. **Cards and equipment
  have no @whobuy**, so their prices are always vend.
- Names wrap across lines ("Expanded Token F / ragment"), and the game may
  spell them differently from the sheet ("Valhala's Flower" vs "Valhalla's
  Flower") or leave out the slots ("Celebrant's Mitten" is
  "Celebrant's Mitten [0]" in the sheet). Match loosely. Ask only when two
  items could be the one meant.

## 2. Update items that are in the sheet

For each item, in `src/data/loot.json`:

- Set `avgVend` (or `avgWhobuy`) to the price, even if it's lower than
  before.
- Set `lastVerified` to today (`YYYY-MM-DD`).
- Set `verificationNotes` to where the price came from, for example
  `"Vend price from a player shop"`. If it's already today's note for the
  other price, join them with `; `.

**Items NPCs sell** (`npcBuyable` "yes" or "npc-only") can't have player
prices; validate fails if they do. Skip them and tell the maintainer.

## 3. Items that aren't in the sheet

Add them (the sheet includes every item a player can hold), following the
`add-items` skill. Use the game's name for the item. Unless the maintainer
says otherwise, an item nothing uses gets `["No Use"]`: all known uses are
already mapped.

## 4. Set the actions from the prices

Admin mode does this whenever a price is saved, and so should you: run the
same suggestion (`src/utils/suggest.js`) for every item you changed, and use
it when it has an answer.

```js
import { createSuggester } from './src/utils/suggest.js';
const suggest = createSuggester(items);
const { actions, sale } = suggest(item);
if (sale && actions.length) item.actions = actions; // no sale = no player price; keep what's set
```

Cards are always Vend. `npm run suggest -- "<name>"` shows the reasoning.
**Tell the maintainer about every item whose actions changed** (for
example Keep + Vend to Keep + NPC), because that changes what the site
advises. Don't undo a change because the price looks odd.

## 5. Sync and check

```bash
npm run sync:prices && npm run sync:shops && npm run validate
```

Run them every time, even when you only added two items: new items get
their NPC price and NPC Shop value from the syncs. A new item that sells
to NPCs for 0z makes validate warn; ask whether it really is 0z (add it to
`customSellValues`), can't be sold (`notSellableToNpc`), or has a price.

## 6. Finish

- Add a line to today's changelog card (`src/data/changelog.js`) naming the
  updated and added items. One card per day: add to it if today has one.
  Otherwise add a card with the next version and set the same one in
  `package.json` (validate checks).
- Commit.
- Report the prices you set, the items you added, and the actions that
  changed.
