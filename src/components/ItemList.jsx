import { memo } from 'react';
import ItemCard from './ItemCard.jsx';
import ItemTable from './ItemTable.jsx';
import { highlightFor } from '../utils/highlight.js';
import { useProgressiveList } from '../utils/useProgressiveList.js';
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
  const shown = useProgressiveList(items);

  return (
    <div className="@container">
      {showTable ? (
        // The box draws the border and rounded corners (the same panel as the filters) and clips the table to them
        // (overflow-clip, unlike hidden or auto, keeps the sticky header working),
        // so the header cells themselves can stay square. `relative` makes it the
        // containing block for the table's screen-reader-only text (absolutely
        // positioned): otherwise that text sits past the box's edge and makes the
        // whole page scroll sideways while the table is in its narrow scroll box.
        <div className="panel relative overflow-clip @max-table-fit:max-h-[calc(100vh-2rem)] @max-table-fit:scroll-pt-14 @max-table-fit:overflow-auto">
          <ItemTable
            items={shown}
            sort={sort}
            onSort={onSort}
            onSelectUse={onSelectUse}
            highlightUses={highlightUses}
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} onSelectUse={onSelectUse} highlightUses={highlightFor(item, highlightUses)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
