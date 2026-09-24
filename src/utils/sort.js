import { ALL_ACTIONS } from './labels.js';
import { npcSellPrice } from './prices.js';

/**
 * Table sorting. The sort state is either null (default order: A-Z, or best
 * match first while searching) or { key, direction }, e.g.
 * { key: 'avgVend', direction: 'desc' }.
 *
 * Empty values (unknown price, never verified, ...) always go to the bottom,
 * whichever direction you sort.
 */

/** "Can you buy it from an NPC?" from most to least available. */
const NPC_BUYABLE_ORDER = { yes: 0, 'npc-only': 1, no: 2 };

/**
 * What each sortable column sorts by. Return null for "no value".
 * The keys are used as `sortKey` on the table columns (components/ItemTable.jsx).
 */
export const SORT_VALUES = {
  name: (item) => item.name,
  // Items group by their actions, in the order they're listed in the schema.
  actions: (item) => (item.actions.length ? item.actions.map((a) => ALL_ACTIONS.indexOf(a)).sort((a, b) => a - b) : null),
  // Items group by their categories, A-Z.
  categories: (item) => (item.categories.length ? [...item.categories].sort().join(', ') : null),
  // How many things the item is used for.
  uses: (item) => (item.uses.length ? item.uses.length : null),
  avgVend: (item) => item.avgVend,
  avgWhobuy: (item) => item.avgWhobuy,
  npcSellPrice: (item) => npcSellPrice(item),
  npcBuyable: (item) => NPC_BUYABLE_ORDER[item.npcBuyable] ?? null,
  lastVerified: (item) => item.lastVerified, // "YYYY-MM-DD" sorts correctly as text.
};

/** Compares two non-empty values: numbers, text, or lists of numbers. */
function compareValues(a, b) {
  if (Array.isArray(a)) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] !== b[i]) return a[i] - b[i];
    }
    return a.length - b.length;
  }
  if (typeof a === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

/** Returns a new, sorted list. Ties keep their current order. */
export function sortItems(items, sort) {
  if (!sort) return items;
  const getValue = SORT_VALUES[sort.key];
  const flip = sort.direction === 'desc' ? -1 : 1;
  return [...items].sort((itemA, itemB) => {
    const a = getValue(itemA);
    const b = getValue(itemB);
    if (a == null && b == null) return 0;
    if (a == null) return 1; // empty values last, in both directions
    if (b == null) return -1;
    return compareValues(a, b) * flip;
  });
}

/** Next state when a column header is clicked: ascending -> descending -> off. */
export function nextSort(current, key) {
  if (current?.key !== key) return { key, direction: 'asc' };
  if (current.direction === 'asc') return { key, direction: 'desc' };
  return null;
}
