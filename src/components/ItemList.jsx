import ItemCard from './ItemCard.jsx';
import ItemTable from './ItemTable.jsx';

/**
 * Shows the items: as a table on wide screens, as cards on narrow ones.
 * Both are rendered and CSS (Tailwind's `lg:` breakpoint, 1024px) decides
 * which one is visible.
 *
 * Props:
 *   items - items to display (already searched/filtered)
 */
export default function ItemList({ items }) {
  if (items.length === 0) {
    return <p className="py-12 text-center text-gray-500">No items match your search.</p>;
  }

  return (
    <>
      <div className="hidden lg:block">
        <ItemTable items={items} />
      </div>

      <ul className="space-y-3 lg:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <ItemCard item={item} />
          </li>
        ))}
      </ul>
    </>
  );
}
