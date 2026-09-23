import schema from '../data/schema.json';

/**
 * Every allowed action and category, read from src/data/schema.json so
 * there is only one list to update.
 */
export const ALL_ACTIONS = schema.$defs.action.enum;
export const ALL_ITEM_TYPES = schema.$defs.itemType.enum;
export const ALL_CATEGORIES = schema.$defs.category.enum;

/**
 * How each action looks in the UI: dark pills with white text, so they
 * stand apart from the light category tags.
 *
 * The keys must match the "action" list in src/data/schema.json.
 * `description` shows as a tooltip when you hover a badge.
 */
export const ACTIONS = {
  Keep: {
    description: 'Keep it: needed for a quest, hat, or pet.',
    className: 'bg-green-700 text-white',
  },
  Vend: {
    description: 'Sell it to players from a vending shop.',
    className: 'bg-amber-700 text-white',
  },
  Whobuy: {
    description: 'Sell it to a player who is buying it (check @whobuy).',
    className: 'bg-purple-700 text-white',
  },
  NPC: {
    description: 'Sell it to an NPC shop.',
    className: 'bg-blue-700 text-white',
  },
};

/** Used for any action that isn't listed above. */
export const FALLBACK_ACTION = { description: '', className: 'bg-gray-600 text-white' };

/**
 * Category chip colors: a rainbow running red -> violet down the A-Z
 * category list in schema.json. Colors are calculated from each category's
 * position, so adding or removing a category keeps the rainbow intact.
 * "Uncategorized" is always gray and isn't part of the rainbow.
 *
 * Uses OKLCH colors (lightness, chroma, hue), so every hue looks equally
 * light and the text stays readable.
 */
const RAINBOW_START_HUE = 25; // red
const RAINBOW_END_HUE = 300; // violet
const GRAY_CATEGORIES = ['Uncategorized'];
const RAINBOW_CATEGORIES = ALL_CATEGORIES.filter((category) => !GRAY_CATEGORIES.includes(category));
const GRAY = { backgroundColor: 'var(--color-gray-200)', color: 'var(--color-gray-700)' };

export function categoryStyle(category) {
  const index = RAINBOW_CATEGORIES.indexOf(category);
  if (index === -1) return GRAY;
  const step = (RAINBOW_END_HUE - RAINBOW_START_HUE) / Math.max(RAINBOW_CATEGORIES.length - 1, 1);
  const hue = RAINBOW_START_HUE + index * step;
  return {
    backgroundColor: `oklch(0.94 0.06 ${hue})`,
    color: `oklch(0.42 0.12 ${hue})`,
  };
}

/** Human-friendly text for the npcBuyable field. */
export const NPC_BUYABLE_LABELS = {
  yes: 'Yes',
  no: 'No',
  'npc-only': 'NPC Only',
};
