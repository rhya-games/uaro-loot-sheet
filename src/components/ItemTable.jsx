import { ActionBadges, CategoryBadges } from './ItemBadges.jsx';
import ItemUses from './ItemUses.jsx';
import RowActions from './RowActions.jsx';
import Tooltip from './Tooltip.jsx';
import VerifiedText from './VerifiedText.jsx';
import { NPC_BUYABLE_LABELS } from '../utils/labels.js';
import { formatZeny } from '../utils/format.js';

/**
 * Table columns, in display order. To add a column, add an entry here.
 *
 *   label     - header text
 *   hideLabel - keep the label for screen readers only
 *   sortKey   - which sort rule clicking the header uses (see utils/sort.js);
 *               leave out for columns that can't be sorted
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
        <div className="font-medium text-fg">{item.name}</div>
        <div className="mt-0.5 text-[13px] text-muted">
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
    render: (item) => <VerifiedText item={item} />,
  },
  {
    label: 'Actions',
    hideLabel: true,
    numeric: true, // right-aligned
    render: (item) => <RowActions item={item} />,
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
            const direction = column.sortKey && sort?.key === column.sortKey ? sort.direction : null;
            return (
              <th
                key={column.label}
                scope="col"
                aria-sort={
                  !column.sortKey ? undefined : direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'
                }
                // Sticks 1rem below the top of the window (lined up with the sidebar).
                // Two shadows: the first paints the page background above it, so rows
                // scrolling past don't show through that gap; the second paints 1px of
                // green to the right, hiding hairline seams between header cells.
                // In the narrow scroll box (see ItemList) it sticks to the box's top instead.
                // Sortable headers have no padding: their button fills the cell (see SortButton).
                className={`sticky top-4 z-10 bg-header font-semibold whitespace-nowrap text-white
                  ${column.sortKey ? 'p-0' : 'px-3 py-3'}
                  shadow-[0_-1rem_0_0_var(--color-page),1px_0_0_0_var(--color-header)]
                  first:rounded-tl-lg last:rounded-tr-lg last:shadow-[0_-1rem_0_0_var(--color-page)]
                  @max-table-fit:top-0 @max-table-fit:shadow-[1px_0_0_0_var(--color-header)]
                  ${column.numeric ? 'text-right' : 'text-left'} ${column.className ?? ''}`}
              >
                {column.sortKey ? (
                  <SortButton column={column} direction={direction} onSort={onSort} />
                ) : (
                  <span className={column.hideLabel ? 'sr-only' : ''}>{column.label}</span>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="bg-surface">
        {items.map((item) => (
          <tr key={item.id} className="group even:bg-subtle hover:bg-accent-soft">
            {COLUMNS.map((column) => (
              <td
                key={column.label}
                className={`border-b border-line px-3 py-3 align-top group-last:border-b-0 ${
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
 * The button fills the whole header cell, so the focus ring outlines the cell.
 * The arrow always sits to the right of the label: shown while sorted by this
 * column, or faintly on hover/focus as a hint. Its space is always reserved,
 * so labels don't shift when it appears.
 */
function SortButton({ column, direction, onSort }) {
  const arrow = direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕';

  const button = (
    <button
      type="button"
      onClick={() => onSort(column.sortKey)}
      // The header is dark green, so the focus ring is white and drawn inside the cell.
      className={`group/sort flex w-full items-center gap-1 rounded-md px-3 py-3 font-semibold
        focus-visible:outline-white focus-visible:-outline-offset-4 ${column.numeric ? 'justify-end' : 'justify-start'}`}
    >
      {column.label}
      <span
        aria-hidden="true"
        className={`w-3 text-center text-xs transition-opacity duration-150 ease-smooth ${
          direction ? 'opacity-100' : 'opacity-0 group-hover/sort:opacity-70 group-focus-visible/sort:opacity-70'
        }`}
      >
        {arrow}
      </span>
    </button>
  );

  // Headers stick to the top of the window, so their tooltips open below.
  return column.title ? (
    <Tooltip text={column.title} placement="bottom" className="flex w-full">
      {button}
    </Tooltip>
  ) : (
    button
  );
}
