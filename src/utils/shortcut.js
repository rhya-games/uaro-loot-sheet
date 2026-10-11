/** How many results the search popover shows. */
export const PALETTE_LIMIT = 6;

/**
 * Whether a keydown is the popover search shortcut: Cmd+K (Mac) or Ctrl+K.
 * Works while typing in a field too, because browsers use Ctrl+K for their
 * own address-bar search and people expect this one to win on the site.
 */
export function isPaletteShortcut(event) {
  return Boolean(
    (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k',
  );
}

/**
 * What the popover shows for a query: the first `limit` results, and how many
 * items matched in all (for "Show all N results"). `search` comes from
 * createSearch(); an empty query shows nothing (the popover shows a hint
 * instead of 600 items).
 */
export function paletteResults(search, query, limit = PALETTE_LIMIT) {
  if (query.trim() === '') return { results: [], total: 0 };
  const matches = search(query);
  return { results: matches.slice(0, limit), total: matches.length };
}

/**
 * The next highlighted row after an arrow key. Wraps around at both ends.
 * `current` is -1 when nothing is highlighted yet.
 */
export function moveHighlight(current, key, count) {
  if (count === 0) return -1;
  if (key === 'ArrowDown') return (current + 1) % count;
  if (key === 'ArrowUp') return current <= 0 ? count - 1 : current - 1;
  return current;
}
