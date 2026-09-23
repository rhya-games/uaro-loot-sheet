/**
 * Changelog entries shown on the Changelog page, newest first.
 * Format based on "Keep a Changelog" (https://keepachangelog.com).
 *
 * To add an entry, copy this template to the TOP of the list:
 *
 *   {
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
 */
export const CHANGE_TYPES = ['Added', 'Changed', 'Fixed', 'Removed'];

export const CHANGELOG = [
  {
    date: '2026-09-23',
    title: 'First version of the site (sample entry)',
    changes: [
      { type: 'Added', text: 'Searchable, sortable table of 643 items from the original Google Sheet.' },
      { type: 'Added', text: 'Filters for action, item type, category, and what an item is used for.' },
      { type: 'Added', text: 'Report Issue flag on every item, plus About, Feedback, and Contribute pages.' },
      { type: 'Changed', text: 'Items that NPCs sell are marked NPC instead of Vend or Whobuy.' },
      { type: 'Fixed', text: 'Five items had the wrong item ID (for example, Peaked Hat used Fly Wing’s ID).' },
      { type: 'Removed', text: 'The Junk and Card Recycler actions. Those items now show NPC or Vend.' },
    ],
  },
];
