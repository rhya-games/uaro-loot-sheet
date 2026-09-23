import Fuse from 'fuse.js';

/**
 * Fuzzy search settings (https://www.fusejs.io/api/options.html).
 * Higher `weight` = matches in that field rank higher.
 */
const FUSE_OPTIONS = {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'details', weight: 1 },
    { name: 'categories', weight: 1 },
  ],
  // 0 = exact match only, 1 = match anything. 0.3 forgives small typos.
  threshold: 0.3,
  // Match anywhere in the text, not just near the start.
  ignoreLocation: true,
};

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
    // Also accept a numeric item ID, e.g. "731".
    if (/^\d+$/.test(trimmed)) {
      const byId = items.filter((item) => item.itemId === Number(trimmed));
      if (byId.length) return byId;
    }
    return fuse.search(trimmed).map((result) => result.item);
  };
}
