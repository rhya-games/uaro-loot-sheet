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
  NPC: {
    description: 'Sell it to an NPC shop.',
    className: 'bg-blue-700 text-white dark:bg-blue-800 dark:text-blue-50',
  },
  Junk: {
    description: 'Throw it away: it has no use, and no player or NPC pays for it.',
    className: 'bg-gray-600 text-white dark:bg-gray-700 dark:text-gray-50',
  },
};

/** Used for any action that isn't listed above. */
export const FALLBACK_ACTION = { description: '', className: 'bg-gray-600 text-white' }; // dark chip in both modes

/**
 * What each category means, in plain words (shown on the About page).
 * The keys must match the "category" list in src/data/schema.json; a test
 * checks that every category has one.
 */
export const CATEGORY_DESCRIPTIONS = {
  Brewing: 'Used to make potions and other brewed items.',
  Card: 'A monster card.',
  Cooking: 'An ingredient for cooking food.',
  'Dungeon Quest': 'Needed for a dungeon quest, like the Sign Quest or Veins Siblings Quest.',
  'Job Quest': 'Needed for a job quest.',
  'Official Hat Quest': 'Needed for a hat quest from the original game.',
  'Other Quest': 'Needed for a quest that isn’t a job, dungeon, hat or repeatable quest.',
  Pet: 'Used for pets: taming items, accessories and evolution materials.',
  'Pet Evolution': 'Needed to evolve a pet.',
  'Repeatable Quest': 'Needed for a quest you can do again and again, like a daily request.',
  'Server Hat Quest': 'Needed for a hat quest added by this server.',
  Skills: 'Used up by a skill, or used for forging.',
  uaRO: 'Content added by this server, not in the original game.',
  'No Use': 'It has no purpose in the other categories, so it’s only worth what it sells for.',
  'Not Reviewed': 'Its purpose hasn’t been checked yet. Only shows while editing the data.',
};

/** A wiki page that lists what a category covers, for the About page. */
export const CATEGORY_LINKS = {
  'Repeatable Quest': { href: 'https://wiki.uaro.net/repeatable-quests/', label: 'See the list on the uaRO wiki.' },
};

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
