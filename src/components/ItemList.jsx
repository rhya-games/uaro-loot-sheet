import { memo } from 'react';
import ItemCard from './ItemCard.jsx';
import ItemTable from './ItemTable.jsx';
import { highlightFor } from '../utils/highlight.js';
import { useMediaQuery } from '../utils/useMediaQuery.js';

/**
 * Shows the items: as a table from 768px up, as cards below that.
 * Only one of the two is drawn (hundreds of rows are expensive to draw).
 *
 * Wrapped in `memo`: it only redraws when its props change, not when
 * unrelated things on the page change (like opening the filter panel).
 * That keeps those interactions instant. The parent must pass the same
 * function objects each time (see useCallback in LootPage).
 *
 * When the table doesn't fit (the list is narrower than the `table-fit`
 * container size, 1170px, in index.css), the table gets its own scroll box:
 * it scrolls sideways inside it and its header sticks to the top of the box.
 * Otherwise the page scrolls and the header sticks to the top of the window.
 * If you add or widen a column, measure the table's narrowest width again.
 *
 * Props:
 *   items       - items to display (already searched, filtered and sorted)
 *   sort        - current sort (the table shows it on its headers)
 *   onSort      - called with a column's sortKey when a table header is clicked
 *   onSelectUse - called when a "Used For" target is clicked
 *   highlightUses - which "Used For" entries to bring forward (see ItemUses)
 */
export default memo(function ItemList({ items, sort, onSort, onSelectUse, highlightUses }) {
  const showTable = useMediaQuery('(min-width: 768px)');

  if (items.length === 0) {
    return <p className="py-12 text-center text-muted">No items match your search or filters.</p>;
  }

  return (
    <div className="@container">
      {showTable ? (
        <div
          className="@max-table-fit:max-h-[calc(100vh-2rem)] @max-table-fit:overflow-auto @max-table-fit:rounded-lg
            @max-table-fit:shadow-sm"
        >
          <ItemTable
            items={items}
            sort={sort}
            onSort={onSort}
            onSelectUse={onSelectUse}
            highlightUses={highlightUses}
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} onSelectUse={onSelectUse} highlightUses={highlightFor(item, highlightUses)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
