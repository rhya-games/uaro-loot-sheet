/**
 * What the list shows when nothing matches: says what's hiding everything
 * and offers a one-click way out, instead of a dead end.
 *
 * Props:
 *   query          - the search text ('' if none)
 *   filterCount    - how many filters are on (including "I keep items for")
 *   onClearSearch  - clears the search box
 *   onClearFilters - clears every filter (the search stays)
 */
export default function NoResults({ query, filterCount, onClearSearch, onClearFilters }) {
  const searching = query.trim() !== '';
  const filtering = filterCount > 0;

  let message = 'No items to show.';
  if (searching && filtering) message = `No items match “${query.trim()}” with your filters.`;
  else if (searching) message = `No items match “${query.trim()}”.`;
  else if (filtering) message = 'No items match your filters.';

  return (
    <div className="panel px-4 py-12 text-center">
      <p className="text-fg">{message}</p>
      <p className="mt-1 text-sm text-muted">
        {searching ? 'Check the spelling, or search for part of the name.' : 'Try turning some filters off.'}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {searching && (
          <button type="button" onClick={onClearSearch} className="button-small">
            Clear search
          </button>
        )}
        {filtering && (
          <button type="button" onClick={onClearFilters} className="button-small">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
