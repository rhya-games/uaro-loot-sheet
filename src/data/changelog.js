/**
 * The Changelog page: what a player needs to know, newest first.
 * Format based on "Keep a Changelog" (https://keepachangelog.com).
 *
 * This page is for the people who use the site, not for us. Keep each day to
 * a few short lines (`npm run validate` errors above 8, and warns about
 * long lines). The long version (what changed, why, how it was checked)
 * goes in the pull request description; see CONTRIBUTING.md, "Changelog".
 *
 * Write a line only if a player would notice the change or do something
 * differently because of it. Then:
 *   - Lead with the biggest change, and give the card a title that says it.
 *   - Sum up data updates in one line with a count ("Prices updated for 40
 *     items"). Name items only when there are three or fewer and they matter.
 *   - Skip work players never see: admin tools, tests, docs, code cleanup.
 *   - One short sentence each, in everyday words. No how-it-works detail.
 *
 * To add an entry, copy this template to the TOP of the list:
 *
 *   {
 *     version: '1.3.0',
 *     date: 'YYYY-MM-DD',
 *     title: 'Short summary of this update',
 *     changes: [
 *       { type: 'Added', text: 'Something new.' },
 *       { type: 'Changed', text: 'Something that works differently now.' },
 *       { type: 'Fixed', text: 'Something that was wrong and is now right.' },
 *       { type: 'Removed', text: 'Something that is gone.' },
 *     ],
 *   },
 *
 * `type` must be one of: Added, Changed, Fixed, Removed.
 * Only include the types you need.
 *
 * One entry per day: add to today's entry if there already is one.
 *
 * Versions follow Semantic Versioning (https://semver.org):
 *   - something new or changed (a feature, new data): raise the middle
 *     number and reset the last (1.2.3 -> 1.3.0)
 *   - only fixes: raise the last number (1.3.0 -> 1.3.1)
 *   - a big change to how the site works: raise the first number
 * Set the same version in package.json (npm run validate checks). Deploying
 * (pushing main to the deploy branch) publishes a GitHub release with that
 * version, these lines, and the notes from the pull requests merged since
 * the last release.
 */
export const CHANGE_TYPES = ['Added', 'Changed', 'Fixed', 'Removed'];

export const CHANGELOG = [
  {
    version: '1.1.0',
    date: '2026-10-13',
    title: 'Vend prices removed (sorry), and a star shows the best price',
    changes: [
      { type: 'Removed', text: 'Vend prices and the Verified column. The server’s rules don’t allow us to publish them, and we’re sorry.' },
      { type: 'Added', text: 'A green star shows the best way to sell: in Vend when players pay more than an NPC, next to the NPC price when the NPC pays the most.' },
      { type: 'Removed', text: '@whobuy prices, the Whobuy column and the Whobuy action.' },
      { type: 'Changed', text: 'Cards, food of +6 or more, cheap equipment and cheap taming items say Vend, until a price says otherwise.' },
      { type: 'Changed', text: 'Actions updated for 131 items, including 3 pet accessories nobody sells, which are now Junk.' },
      { type: 'Fixed', text: 'Items only needed for a job quest no longer say Keep (8 items).' },
      { type: 'Fixed', text: 'Pet evolution materials now carry the Pet Evolution, Pet and uaRO categories (8 items).' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-10-12',
    title: 'Version 1.0: the loot sheet, rebuilt as a site',
    changes: [
      { type: 'Added', text: '1,110 items, up from 643 in the original sheet: drops, NPC-sold items, foods, pet items and headgear materials.' },
      { type: 'Added', text: 'Every item shows its in-game icon, and its NPC price including the Overcharge bonus and uaRO’s own price changes.' },
      { type: 'Added', text: '“Used For” lists quests, recipes, pet evolutions, pet food and cooking, with the amounts needed.' },
      { type: 'Added', text: 'Vend and @whobuy prices checked in game for 240 items, with the date they were last verified.' },
      { type: 'Added', text: 'Search from any page with Ctrl+K, filter by action, type, category and use, and share a link to the same view.' },
      { type: 'Changed', text: 'Actions now follow the prices: Vend, Whobuy, NPC or Keep. Items you keep also show how to sell the extras.' },
      { type: 'Changed', text: 'Empty values are clear: ? is not checked yet, ✕ can’t be done, and None means checked and empty.' },
      { type: 'Added', text: 'Works on phones as cards, in light and dark mode, and is open source so anyone can help keep it up to date.' },
    ],
  },
  {
    version: '0.11.0',
    date: '2026-10-11',
    title: 'Search from anywhere, more checked prices',
    changes: [
      { type: 'Added', text: 'Press Ctrl+K (Cmd+K on Mac) or use the new Search button to find an item from any page.' },
      { type: 'Added', text: 'Vend and @whobuy prices updated for 117 items, all checked in game today. Actions updated for 38 of them to match.' },
      { type: 'Added', text: 'Links to the sheet now show a preview picture and description when you share them in chat.' },
      { type: 'Changed', text: 'The page opens faster: the header and search box show while the items load.' },
      { type: 'Changed', text: 'Vend and Whobuy are now suggested whenever players pay even 1z more than NPCs. Actions updated for 11 items.' },
      { type: 'Added', text: 'Prices updated for 18 more items.' },
      { type: 'Added', text: 'Uses added for the cooking kits, Temporal Crystal, Green Potion, Diamond Ring and 3 more items. Cooking kits now show that they are used for Cooking.' },
      { type: 'Added', text: 'Pet food now says which pets eat it, under "Used For" (42 items). Cheap Lubricant and Mochi are new.' },
    ],
  },
  {
    version: '0.9.0',
    date: '2026-10-10',
    title: 'Easier to find your way around the text pages',
    changes: [
      { type: 'Added', text: 'A short welcome box shows how to use the sheet on your first visit. The same steps are on the About page.' },
      { type: 'Added', text: 'About, Feedback and Changelog have an "On this page" list beside the text. It jumps to a section and shows where you are.' },
      { type: 'Changed', text: 'The About page is easier to scan, with short steps and a list of what each mark means.' },
      { type: 'Changed', text: 'The Back to top button shows up sooner on those pages.' },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-10-09',
    title: 'Item icons, and clearer empty values',
    changes: [
      { type: 'Added', text: 'Every item now shows its in-game icon next to its name.' },
      { type: 'Changed', text: 'Empty values are clearer: ? means not checked yet, and None, No sellers and No buyers mean it was checked.' },
      { type: 'Changed', text: 'The table now uses the full width of the window, and rows no longer alternate colors.' },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-10-08',
    title: 'Actions now follow the prices',
    changes: [
      { type: 'Changed', text: 'Actions updated for 315 items to match their prices, 18 of them for the first time.' },
      { type: 'Changed', text: 'Keep is never the only action now: items you keep also show how to sell the extras.' },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-09-27',
    title: 'More quest uses, and two new items',
    changes: [
      { type: 'Added', text: 'Two Tool Dealer items: Awakening Potion and Green Potion.' },
      { type: 'Added', text: 'More in “Used For”: two El Dicastes quests, weapon forging, Expanded Token Fragments, and masks for the Nameless Island quest.' },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-09-26',
    title: 'More El Dicastes requests, and a home screen icon',
    changes: [
      {
        type: 'Added',
        text: 'The El Dicastes Daily Quest now shows on Clam Shell (50), Withered Flower (6) and Meat (50).',
      },
      {
        type: 'Added',
        text: 'The El Dicastes Daily Quest also shows on Zargon (26), Bill of Birds (50) and Potato (50).',
      },
      { type: 'Added', text: 'An icon for adding the site to an iPhone or iPad home screen.' },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-09-25',
    title: 'Visit counts, and clearer search highlights',
    changes: [
      {
        type: 'Added',
        text: 'The site counts visits, searches and filter use, without cookies, to learn what to improve. See About.',
      },
      { type: 'Added', text: 'Vend prices updated for six items, and two new items: Bloody Branch and Poring Box.' },
      { type: 'Changed', text: 'Uses you search for or filter by are highlighted in the list, and the others stay as they are.' },
      { type: 'Fixed', text: 'The “Used For” filter you click stays visible above the list when the filter panel is open.' },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-09-24',
    title: 'Lots more loot, suggested actions, and sharing',
    changes: [
      {
        type: 'Added',
        text: 'Share button: a link opens the same search, filters and sort. Your last view comes back on your next visit.',
      },
      {
        type: 'Added',
        text: 'About 450 more items: all 60 foods, drops from quest monsters and uaRO’s renewal areas, pet items and headgear materials.',
      },
      {
        type: 'Added',
        text: 'More in “Used For”: official quests, skills, the Level 4 weapon quest and cooking. “Not used up” and “each cast” are noted.',
      },
      {
        type: 'Added',
        text: 'Small extras: click an item ID to copy it, a back to top button, a loot bag icon, and version numbers.',
      },
      {
        type: 'Changed',
        text: '“I keep items for” replaces “I don’t keep items”: tick hats, pets, cooking, crafting or quests, and other items show how to sell them.',
      },
      {
        type: 'Changed',
        text: 'Vend and Whobuy tell ✕ (can’t be sold that way), None (nobody buying or selling) and — (not checked yet) apart.',
      },
      {
        type: 'Changed',
        text: '“Uncategorized” is now “No Use”. Used For is sorted A-Z, and long lists show “+N more”.',
      },
      {
        type: 'Fixed',
        text: 'NPC Shop is filled in for every item, and items NPCs sell say NPC. Pet and headgear materials now match the uaRO wiki.',
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-09-23',
    title: 'First version of the site',
    changes: [
      {
        type: 'Added',
        text: 'The loot table: 643 items from the original sheet, searchable and sortable, with filters for action, type, category and use.',
      },
      {
        type: 'Added',
        text: 'NPC prices for every item (with the Overcharge bonus), uaRO’s lower prices, and a ✕ for items NPCs won’t buy.',
      },
      { type: 'Added', text: 'A Report Issue flag on every item, and the About, Feedback and Contribute pages.' },
      { type: 'Changed', text: 'Items that NPCs sell say NPC instead of Vend or Whobuy.' },
      { type: 'Fixed', text: 'Item names and IDs that didn’t match the game, like Miracle Bandage and Peaked Hat.' },
    ],
  },
];
