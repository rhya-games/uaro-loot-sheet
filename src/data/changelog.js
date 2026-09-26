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
 *     version: '0.3.0',
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
 * Versions follow Semantic Versioning (https://semver.org), except that the
 * site stays at 0.x until its first real release (1.0.0):
 *   - something new or changed (a feature, new data): raise the middle
 *     number and reset the last (0.2.3 -> 0.3.0)
 *   - only fixes: raise the last number (0.3.0 -> 0.3.1)
 * Set the same version in package.json (npm run validate checks). Merging
 * to main publishes a GitHub release with that version, these lines, and
 * the notes from the pull requests merged since the last release.
 */
export const CHANGE_TYPES = ['Added', 'Changed', 'Fixed', 'Removed'];

export const CHANGELOG = [
  {
    version: '0.4.0',
    date: '2026-09-26',
    title: 'More El Dicastes daily requests',
    changes: [
      {
        type: 'Added',
        text: 'The El Dicastes Daily Quest now shows on Clam Shell (50), Withered Flower (6) and Meat (50).',
      },
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
