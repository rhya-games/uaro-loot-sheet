/**
 * Which "Used For" entries to bring forward and highlight on an item (see ItemUses):
 *   - targets picked in the "Used For" filter, always
 *   - uses the search text matches as whole words, but only when the search
 *     didn't match the item's own name
 *
 * `highlight` is { targets: ["Love Guard [1]"], matchesSearch: (text) => bool | null }.
 */
export const NO_HIGHLIGHT = { targets: [], matchesSearch: null };

/** A test for one use: true when it should be brought forward and highlighted. */
export function highlightedUseTest(item, { targets, matchesSearch }) {
  const searchFindsUses = matchesSearch && !matchesSearch(item.name);
  return (use) => targets.includes(use.for) || Boolean(searchFindsUses && matchesSearch(use.for));
}

/**
 * The highlight to give one item's row: the real one when some of its uses
 * match, otherwise NO_HIGHLIGHT. Rows that don't match then get the same
 * value on every keystroke, so memo'd rows skip redrawing.
 */
export function highlightFor(item, highlight) {
  if (highlight === NO_HIGHLIGHT || !item.uses.length) return NO_HIGHLIGHT;
  return item.uses.some(highlightedUseTest(item, highlight)) ? highlight : NO_HIGHLIGHT;
}
