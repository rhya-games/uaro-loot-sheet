import ItemCard from './ItemCard.jsx';
import ItemTable from './ItemTable.jsx';

/**
 * Shows the items: as a table from 768px (`md:`) up, as cards below that.
 * Both are rendered and CSS decides which one is visible.
 *
 * When the table doesn't fit (the list is narrower than the `table-fit`
 * container size, 1120px, in index.css), the table gets its own scroll box:
 * it scrolls sideways inside it and its header sticks to the top of the box.
 * Otherwise the page scrolls and the header sticks to the top of the window.
 * If you add or widen a column, measure the table's narrowest width again.
 *
 * Props:
 *   items       - items to display (already searched, filtered and sorted)
 *   sort        - current sort (the table shows it on its headers)
 *   onSort      - called with a column's sortKey when a table header is clicked
 *   onSelectUse - called when a "Used For" target is clicked
 */
export default function ItemList({ items, sort, onSort, onSelectUse }) {
  if (items.length === 0) {
    return <p className="py-12 text-center text-subtle-fg">No items match your search or filters.</p>;
  }

  return (
    <div className="@container">
      <div
        className="hidden md:block @max-table-fit:max-h-[calc(100vh-2rem)] @max-table-fit:overflow-auto
          @max-table-fit:rounded-lg @max-table-fit:shadow-sm"
      >
        <ItemTable items={items} sort={sort} onSort={onSort} onSelectUse={onSelectUse} />
      </div>

      <ul className="space-y-3 md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <ItemCard item={item} onSelectUse={onSelectUse} />
          </li>
        ))}
      </ul>
    </div>
  );
}
