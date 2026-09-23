import schema from '../data/schema.json';

/**
 * Every allowed action and category, read from src/data/schema.json so
 * there is only one list to update.
 */
export const ALL_ACTIONS = schema.$defs.action.enum;
export const ALL_ITEM_TYPES = schema.$defs.itemType.enum;
export const ALL_CATEGORIES = schema.$defs.category.enum;

/**
 * How each action looks in the UI.
 *
 * The keys must match the "action" list in src/data/schema.json.
 * `description` shows as a tooltip when you hover a badge.
 * `className` uses Tailwind color classes, similar to the old Google Sheet.
 */
export const ACTIONS = {
  Keep: {
    description: 'Keep it: needed for a quest, hat, or pet.',
    className: 'bg-green-100 text-green-800',
  },
  Vend: {
    description: 'Sell it to players from a vending shop.',
    className: 'bg-yellow-100 text-yellow-800',
  },
  Whobuy: {
    description: 'Sell it to a player who is buying it (check @whobuy).',
    className: 'bg-purple-100 text-purple-800',
  },
  NPC: {
    description: 'Sell it to an NPC shop.',
    className: 'bg-blue-100 text-blue-800',
  },
  Junk: {
    description: 'Not worth anything. Drop it or sell it to an NPC.',
    className: 'bg-gray-200 text-gray-700',
  },
};

/** Used for any action that isn't listed above. */
export const FALLBACK_ACTION = { description: '', className: 'bg-gray-100 text-gray-700' };

/**
 * Color for each category tag. Quests use warm colors, pets use greens,
 * crafting uses cool colors.
 *
 * The keys must match the "category" list in src/data/schema.json.
 * Any category not listed here shows in gray.
 */
export const CATEGORY_COLORS = {
  'Official Hat Quest': 'bg-orange-100 text-orange-800',
  'Server Hat Quest': 'bg-amber-100 text-amber-800',
  'Dungeon Quest': 'bg-red-100 text-red-800',
  'Job Quest': 'bg-pink-100 text-pink-800',
  'Repeatable Quest': 'bg-rose-100 text-rose-800',
  'Other Quest': 'bg-fuchsia-100 text-fuchsia-800',
  Pet: 'bg-lime-100 text-lime-800',
  'Pet Evolution': 'bg-emerald-100 text-emerald-800',
  Cooking: 'bg-sky-100 text-sky-800',
  Brewing: 'bg-indigo-100 text-indigo-800',
  Skills: 'bg-violet-100 text-violet-800',
  Card: 'bg-slate-200 text-slate-700',
  uaRO: 'bg-cyan-100 text-cyan-800',
};

/** Used for any category that isn't listed above. */
export const FALLBACK_CATEGORY_COLOR = 'bg-gray-100 text-gray-700';

/** Human-friendly text for the npcBuyable field. */
export const NPC_BUYABLE_LABELS = {
  yes: 'Yes',
  no: 'No',
  'npc-only': 'NPC Only',
};
