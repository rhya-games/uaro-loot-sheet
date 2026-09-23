import Fuse from 'fuse.js';

/**
 * How search works:
 *   1. A number finds the item with that item ID, e.g. "731".
 *   2. Exact search: items containing every word you typed (in any order).
 *      Name matches are listed first.
 *   3. Fuzzy search, ONLY if exact search found nothing. This forgives
 *      typos ("diamnod" -> Diamond) without adding look-alike results
 *      when your spelling was right ("gloom" won't show "Blush of Groom").
 */

/** The text of an item that search looks at, in ranking order (name counts most). */
const searchableFields = (item) => [item.name, ...item.uses.map((use) => use.for), item.notes, ...item.categories];

/**
 * Fuzzy search settings (https://www.fusejs.io/api/options.html).
 * Higher `weight` = matches in that field rank higher.
 */
const FUSE_OPTIONS = {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'uses.for', weight: 1 },
    { name: 'notes', weight: 1 },
    { name: 'categories', weight: 1 },
  ],
  // 0 = exact match only, 1 = match anything. 0.3 forgives small typos.
  threshold: 0.3,
  // Match anywhere in the text, not just near the start.
  ignoreLocation: true,
};

/**
 * Items containing every word of the query, best first:
 * name starts with the query > name contains every word > found elsewhere.
 */
function exactSearch(items, query) {
  const needle = query.toLowerCase();
  const words = needle.split(/\s+/);
  const ranked = [];
  for (const item of items) {
    const name = item.name.toLowerCase();
    const allText = searchableFields(item).join(' ').toLowerCase();
    if (!words.every((word) => allText.includes(word))) continue;

    let rank = 2;
    if (name.startsWith(needle)) rank = 0;
    else if (words.every((word) => name.includes(word))) rank = 1;
    ranked.push({ item, rank });
  }
  // Array sort is stable, so items with the same rank stay in A-Z order.
  return ranked.sort((a, b) => a.rank - b.rank).map((entry) => entry.item);
}

/**
 * Builds a search function for a list of items.
 *
 *   const search = createSearch(items);
 *   search('diamond'); // -> items matching "diamond", best match first
 *   search('');        // -> all items, unchanged
 */
export function createSearch(items) {
  const fuse = new Fuse(items, FUSE_OPTIONS);
  return (query) => {
    const trimmed = query.trim();
    if (!trimmed) return items;

    if (/^\d+$/.test(trimmed)) {
      const byId = items.filter((item) => item.itemId === Number(trimmed));
      if (byId.length) return byId;
    }

    const exact = exactSearch(items, trimmed);
    if (exact.length) return exact;

    return fuse.search(trimmed).map((result) => result.item);
  };
}
