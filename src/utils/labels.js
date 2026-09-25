import schema from '../data/schema.json' with { type: 'json' };

/**
 * Every allowed action and category, read from src/data/schema.json so
 * there is only one list to update.
 */
export const ALL_ACTIONS = schema.$defs.action.enum;

/** Actions offered in the filter panel. Junk is left out: nobody filters for it. */
export const FILTER_ACTIONS = ALL_ACTIONS.filter((action) => action !== 'Junk');
export const ALL_ITEM_TYPES = schema.$defs.itemType.enum;
/**
 * Items waiting for review ("Not Reviewed") only show while running
 * `npm run dev`; the published site leaves them out (see admin/useAdmin.js),
 * so it doesn't offer that category either.
 */
export const IN_DEV = Boolean(import.meta.env?.DEV);
export const ALL_CATEGORIES = schema.$defs.category.enum.filter((category) => IN_DEV || category !== 'Not Reviewed');

/**
 * How each action looks in the UI: strong-colored chips, so they stand apart
 * from the softer category chips. Dark mode uses deeper, less vivid shades.
 *
 * The keys must match the "action" list in src/data/schema.json.
 * `description` shows as a tooltip when you hover a badge.
 */
export const ACTIONS = {
  Keep: {
    description: 'Keep it: needed for a quest, hat, or pet.',
    className: 'bg-green-700 text-white dark:bg-green-800 dark:text-green-50',
  },
  Vend: {
    description: 'Sell it to players from a vending shop.',
    className: 'bg-amber-700 text-white dark:bg-amber-800 dark:text-amber-50',
  },
  Whobuy: {
    description: 'Sell it to a player who is buying it (check @whobuy).',
    className: 'bg-purple-700 text-white dark:bg-purple-800 dark:text-purple-50',
  },
  NPC: {
    description: 'Sell it to an NPC shop.',
    className: 'bg-blue-700 text-white dark:bg-blue-800 dark:text-blue-50',
  },
  Junk: {
    description: 'Throw it away: nothing uses it and nobody pays for it.',
    className: 'bg-gray-600 text-white dark:bg-gray-700 dark:text-gray-50',
  },
};

/** Used for any action that isn't listed above. */
export const FALLBACK_ACTION = { description: '', className: 'bg-gray-600 text-white' }; // dark chip in both modes

/**
 * Category chip colors: a rainbow running red -> violet down the A-Z
 * category list in schema.json. Colors are calculated from each category's
 * position, so adding or removing a category keeps the rainbow intact.
 * "No Use" and "Not Reviewed" are gray and aren't part of the rainbow: they
 * say the item isn't used for anything (yet). "Not Reviewed" is dashed, so
 * unchecked items stand out from ones checked and found useless.
 *
 * Each chip gets its hue as a CSS variable (--chip-hue); the classes below
 * turn it into a light chip in light mode and a dark chip in dark mode.
 * OKLCH colors (lightness, chroma, hue) keep every hue equally readable.
 */
const RAINBOW_START_HUE = 25; // red
const RAINBOW_END_HUE = 300; // violet
const GRAY_CHIPS = {
  'No Use': 'bg-chip text-body',
  'Not Reviewed': 'border border-dashed border-line-strong text-muted',
};
const GRAY_CATEGORIES = Object.keys(GRAY_CHIPS);
const RAINBOW_CATEGORIES = ALL_CATEGORIES.filter((category) => !GRAY_CATEGORIES.includes(category));
const RAINBOW_CLASSES =
  'bg-[oklch(0.94_0.06_var(--chip-hue))] text-[oklch(0.42_0.12_var(--chip-hue))] ' +
  'dark:bg-[oklch(0.3_0.04_var(--chip-hue))] dark:text-[oklch(0.87_0.05_var(--chip-hue))]';

/** Props for a category chip: { className, style }. */
export function categoryChip(category) {
  const index = RAINBOW_CATEGORIES.indexOf(category);
  if (index === -1) return { className: GRAY_CHIPS[category] ?? 'bg-chip text-body' };
  const step = (RAINBOW_END_HUE - RAINBOW_START_HUE) / Math.max(RAINBOW_CATEGORIES.length - 1, 1);
  return { className: RAINBOW_CLASSES, style: { '--chip-hue': RAINBOW_START_HUE + index * step } };
}

/** Human-friendly text for the npcBuyable field. */
export const NPC_BUYABLE_LABELS = {
  yes: 'Yes',
  no: 'No',
  'npc-only': 'NPC Only',
};
