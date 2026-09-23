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
  'Card Recycler': {
    description: 'Trade it in at the Card Recycler.',
    className: 'bg-teal-100 text-teal-800',
  },
  Junk: {
    description: 'Not worth anything. Drop it or sell it to an NPC.',
    className: 'bg-gray-200 text-gray-700',
  },
};

/** Used for any action that isn't listed above. */
export const FALLBACK_ACTION = { description: '', className: 'bg-gray-100 text-gray-700' };

/** Human-friendly text for the npcBuyable field. */
export const NPC_BUYABLE_LABELS = {
  yes: 'Yes',
  no: 'No',
  'npc-only': 'Yes (NPC only)',
};
