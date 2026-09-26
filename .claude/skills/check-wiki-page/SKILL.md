---
name: check-wiki-page
description: Check the loot sheet's "Used For" data against a uaRO wiki page (headgear quests, pet evolutions, other recipe tables), fix the differences, and add missing items. Use when the maintainer shares a wiki.uaro.net link or asks to validate/check the sheet against the wiki.
---

# Check the sheet against a uaRO wiki page

Read AGENTS.md first (hard rules, data conventions, sources).

## 1. Read the wiki table in the browser

wiki.uaro.net blocks `curl`, and WebFetch only returns a lossy summary. Open
the page in the browser pane and pull the table out with JavaScript, for
example:

```js
[...document.querySelectorAll('table')].map((t) => [...t.rows[0].cells].map((c) => c.innerText.trim()).join(' | '))
```

Then read the rows of the table you need (`cell.innerText` splits the
materials onto separate lines, like `Poring Coin - 1500`).

## 2. Save it as recipes and compare

Write the table to a JSON file in the scratchpad (not the repo):

```json
[{ "target": "Mitra [1]", "materials": [["Poring Coin", 1500], ["Handcuffs", 1000]] }]
```

A material with no quantity is `1`. Then run:

```bash
npm run check:uses -- <scratchpad>/recipes.json
npm run check:uses -- <scratchpad>/recipes.json --suffix " Pet Evolution"   # pet evolutions
```

It lists quantity differences, missing uses, extra uses in the sheet,
targets it couldn't find, and items not in the sheet.

- **Item or target "not in the sheet" but it is, under another name?** Add
  it to `scripts/source/name-aliases.mjs` and run again. The wiki often uses
  older names (Spiritual Bandage = Miracle Bandage, Blood Red = Red Blood).
- Repeat until only real differences are left.

## 3. Fix the sheet

The wiki is the authority for uaRO recipes. Edit `src/data/loot.json`
with a small Node script (keep it in the scratchpad):

- Fix quantities, add missing uses, and remove uses the wiki doesn't list.
  Reuse the sheet's existing target name exactly (`"<Pet> Pet Evolution"`
  for pets).
- New "Used For" targets: follow the sheet's naming pattern.
- Items that gain a quest or evolution use also get the matching categories
  (see "Conventions when adding items" in AGENTS.md). An item that loses its
  only use of a kind loses those categories.
- **Missing items:** add them with the `add-items` skill (ID lookup, every
  field, categories and actions). Use the wiki's (in-game) name, and note
  the emulator name if it differs. Copy the actions/categories/notes
  pattern of a similar existing item.
- If the CSV import should match, mirror new IDs and renames in
  `scripts/source/sheet-corrections.mjs`.
- New "Used For" targets need item IDs for the Targets page: run
  `npm run sync:targets`.
- Keep `loot.json` sorted by name.

Then:

```bash
npm run sync:prices && npm run sync:shops && npm run validate
npm run check:uses -- <scratchpad>/recipes.json   # should be 0 differences
```

## 4. Finish

- Add a line to today's card in `src/data/changelog.js` (one card per day;
  a new day needs the next version, also in `package.json`).
- Commit with a message that lists the kinds of fixes.
- Report to the maintainer: the fixes (a small table for quantities), new
  items, and anything that needs a decision. Examples: the wiki and the
  emulators disagree, an item the maintainer removed before shows up again,
  or the wiki looks like it has a copy-paste mistake. Ask, don't guess.
