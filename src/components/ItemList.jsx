import ItemCard from './ItemCard.jsx';
import ItemTable from './ItemTable.jsx';

/**
 * Shows the items: as a table when there's room, as cards when there isn't.
 * Both are rendered and CSS decides which one is visible. It uses a
 * container query (based on the space this list has, not the whole screen),
 * so opening the filter sidebar on a small laptop switches to cards
 * instead of making the page scroll sideways.
 *
 * 1060px is just above the table's narrowest possible width (about 1042px).
 * If you add a column or widen one, measure again and raise it.
 *
 * Props:
 *   items       - items to display (already searched, filtered and sorted)
 *   sort        - current sort (the table shows it on its headers)
 *   onSort      - called with a column's sortKey when a table header is clicked
 *   onSelectUse - called when a "Used For" target is clicked
 */
export default function ItemList({ items, sort, onSort, onSelectUse }) {
  if (items.length === 0) {
    return <p className="py-12 text-center text-gray-500">No items match your search or filters.</p>;
  }

  return (
    <div className="@container">
      <div className="hidden @min-[1060px]:block">
        <ItemTable items={items} sort={sort} onSort={onSort} onSelectUse={onSelectUse} />
      </div>

      <ul className="space-y-3 @min-[1060px]:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <ItemCard item={item} onSelectUse={onSelectUse} />
          </li>
        ))}
      </ul>
    </div>
  );
}
