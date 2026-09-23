import { ActionBadges, CategoryBadges } from './ItemBadges.jsx';
import ItemUses from './ItemUses.jsx';
import { NPC_BUYABLE_LABELS } from '../utils/labels.js';
import { formatVerified, formatZeny, verifiedTooltip } from '../utils/format.js';

/**
 * Table columns, in display order. To add a column, add an entry here.
 *
 *   label     - header text
 *   sortKey   - which sort rule clicking the header uses (see utils/sort.js)
 *   title     - optional header tooltip
 *   numeric   - right-align (for numbers); also keeps the value on one line
 *   nowrap    - keep the value on one line
 *   className - extra classes for the column (e.g. width)
 *   render    - how to show the value for one item: (item, handlers) => ...
 */
const COLUMNS = [
  {
    label: 'Item Name',
    sortKey: 'name',
    className: 'min-w-48',
    render: (item) => (
      <>
        <div className="font-medium text-gray-900">{item.name}</div>
        <div className="mt-0.5 text-[13px] text-gray-600">
          {item.itemType}
          {item.itemId && ` · #${item.itemId}`}
        </div>
      </>
    ),
  },
  {
    label: 'Action',
    sortKey: 'actions',
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        <ActionBadges actions={item.actions} />
      </div>
    ),
  },
  {
    label: 'Category',
    sortKey: 'categories',
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        <CategoryBadges categories={item.categories} />
      </div>
    ),
  },
  {
    label: 'Used For',
    sortKey: 'uses',
    title: 'Sorts by how many things the item is used for',
    className: 'min-w-44',
    render: (item, { onSelectUse }) => <ItemUses item={item} onSelectUse={onSelectUse} />,
  },
  {
    label: 'Vend',
    sortKey: 'avgVend',
    title: 'Average price in player vending shops',
    numeric: true,
    render: (item) => formatZeny(item.avgVend),
  },
  {
    label: 'Whobuy',
    sortKey: 'avgWhobuy',
    title: 'Average price players pay through @whobuy',
    numeric: true,
    render: (item) => formatZeny(item.avgWhobuy),
  },
  {
    label: 'NPC Sell',
    sortKey: 'npcSellPrice',
    title: 'Zeny from selling to an NPC with Overcharge level 10',
    numeric: true,
    render: (item) => formatZeny(item.npcSellPrice),
  },
  {
    label: 'NPC Buy',
    sortKey: 'npcBuyable',
    nowrap: true,
    title: 'Can you buy this from an NPC?',
    render: (item) => NPC_BUYABLE_LABELS[item.npcBuyable] ?? '—',
  },
  {
    label: 'Verified',
    sortKey: 'lastVerified',
    nowrap: true,
    title: 'When this entry was last checked on the live server',
    render: (item) => <span title={verifiedTooltip(item)}>{formatVerified(item.lastVerified)}</span>,
  },
];

/**
 * Items shown as a table, like the original Google Sheet.
 * Used on wide screens (see ItemList).
 *
 * Props:
 *   items       - items to display (already sorted)
 *   sort        - current sort, e.g. { key: 'avgVend', direction: 'desc' }, or null
 *   onSort      - called with a column's sortKey when its header is clicked
 *   onSelectUse - called when a "Used For" target is clicked
 */
export default function ItemTable({ items, sort, onSort, onSelectUse }) {
  return (
    <table className="panel w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr>
          {COLUMNS.map((column) => {
            const direction = sort?.key === column.sortKey ? sort.direction : null;
            return (
              <th
                key={column.label}
                scope="col"
                aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
                // Sticks 1rem below the top of the window (lined up with the sidebar).
                // The shadow paints the page background above it, so rows scrolling
                // past don't show through that gap.
                className={`sticky top-4 z-10 bg-emerald-800 px-3 py-3 font-semibold whitespace-nowrap text-white
                  shadow-[0_-1rem_0_0_var(--color-gray-50)] first:rounded-tl-lg last:rounded-tr-lg
                  ${column.numeric ? 'text-right' : 'text-left'} ${column.className ?? ''}`}
              >
                <SortButton column={column} direction={direction} onSort={onSort} />
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="bg-white">
        {items.map((item) => (
          <tr key={item.id} className="group even:bg-gray-50 hover:bg-emerald-50">
            {COLUMNS.map((column) => (
              <td
                key={column.label}
                className={`border-b border-gray-200 px-3 py-3 align-top group-last:border-b-0 ${
                  column.numeric ? 'text-right whitespace-nowrap tabular-nums' : ''
                } ${column.nowrap ? 'whitespace-nowrap' : ''}`}
              >
                {column.render(item, { onSelectUse })}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * A column header you can click (or focus and press Enter/Space) to sort.
 * The arrow shows while sorted by this column, or on hover/focus as a hint.
 *
 * The arrow sits in the header's padding (absolutely positioned) so it doesn't
 * make columns wider: after the label on text columns, before it on number
 * columns (which are right-aligned).
 */
function SortButton({ column, direction, onSort }) {
  const arrow = direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕';

  return (
    <button
      type="button"
      onClick={() => onSort(column.sortKey)}
      title={column.title}
      // The header is dark green, so the focus ring is white here (same size and shape).
      className="group/sort relative rounded font-semibold focus-visible:outline-white"
    >
      {column.label}
      <span
        aria-hidden="true"
        className={`absolute top-1/2 w-2.5 -translate-y-1/2 text-center text-xs ${
          column.numeric ? 'right-full mr-0.5' : 'left-full ml-0.5'
        } ${direction ? 'opacity-100' : 'opacity-0 group-hover/sort:opacity-70 group-focus-visible/sort:opacity-70'}`}
      >
        {arrow}
      </span>
    </button>
  );
}
