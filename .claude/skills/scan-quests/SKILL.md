---
name: scan-quests
description: Find items the emulators' quest scripts take or check for, and add the missing official quest uses to "Used For" in loot.json. Use when the maintainer asks to look for missing quest uses, or after adding items that might be quest materials.
---

# Find missing quest uses

Read AGENTS.md first. Quest uses are "Used For" entries like
`{ "for": "Rogue Job Quest", "qty": 5 }`, and the item gets the matching
category (`Job Quest` or `Other Quest`).

## 1. Scan the scripts

```bash
npm run scan:quests -- --new          # items the sheet marks No Use: look here first
npm run scan:quests -- "Talon"        # one item (use the sheet's name)
npm run scan:quests -- --path jobs    # only script files with "jobs" in the path
npm run scan:quests -- --renewal      # rAthena's renewal scripts, for uaRO's renewal areas
```

It reads the scripts a pre-renewal server loads (Hercules) and lists every
item in the sheet that a script **takes** (`delitem`, a real use) or **only
checks** (`countitem`). It prints quantity expressions as written, so read
the script (the file is in the output, on GitHub under `npc/`) when it says
something like `takes .@amount`. Files download once into `scripts/.cache/`.

## 2. Decide what belongs

The maintainer's rules (ask if a case isn't covered):

- **Include:** job change quests, the Sign quest, Episode 13, town and
  repeatable quests, equipment quests (ninja, gunslinger), and other
  official quests players do.
- **Skip seal quests** (`quests/seals/`) and **skill quests**
  (`quests/skills/`): uaRO has a platinum skill NPC.
- **"Only checks" is a use, but not used up.** The weapons that break the
  Sign seal and the whips for the Zealotus Mask are examples. Add the use
  with the note `not used up`; it never makes the item a Keep.
- **Skip guild and party relay quests** (`quests/guildrelay.txt`,
  `quests/partyrelay.txt`): they don't exist on uaRO (the maintainer, 2026-09-26).
- **Skip the Hair Dresser** (`merchants/hair_style.txt`): uaRO has a stylist
  instead, and hair dyes are not quests.
- **Not quests:** a shop or a refiner is not a quest. Ask before adding
  those as uses.
- **"Any of these items" checks:** a script may accept one of many items
  (the Nameless Island quest takes any of 20 masks, and keeps it). Give
  every accepted item that is in the sheet the same use, noted
  `any mask; not used up`, and check the wiki says one is enough.
- **Checking the Official wiki:** its pages read through the MediaWiki API
  (`/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&titles=...`)
  from a page on that site; the normal search page shows a bot check, so
  use the API instead of searching in the page.

## 3. Add the uses

For each item you add (a small Node script in the scratchpad, then keep
`loot.json` in its current format):

- Reuse the sheet's target names exactly (look at similar items:
  `"<Job> Job Quest"`, `"Sign Quest"`, `"Episode 13 Quests"`). A new quest
  gets a name in the same pattern.
- `qty` is required (schema): the script's quantity, or `1`. Say what it
  is for in `note` only when it helps ("points each", "not used up").
- Categories: add `Job Quest` or `Other Quest`. An item that had `No Use`
  loses it (it can't have uses or other categories).
- Quests need no value on the Targets page: a quest use is always a
  reason to Keep, except `not used up`.

## 4. Check

```bash
npm run sync:targets && npm run validate && npm run suggest
```

Then add one summed-up line to today's changelog card if a player would
notice ("Official quests shown on 12 more items"), commit, and report what
you added, what you skipped and why, and the questions.
