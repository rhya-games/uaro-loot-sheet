import { memo } from 'react';
import { ActionBadges, CategoryBadges } from './ItemBadges.jsx';
import { highlightFor } from '../utils/highlight.js';
import ItemUses from './ItemUses.jsx';
import CopyItemId from './CopyItemId.jsx';
import RowActions from './RowActions.jsx';
import Tooltip from './Tooltip.jsx';
import VerifiedText from './VerifiedText.jsx';
import { NpcBuyable } from './StatusIcons.jsx';
import NpcSellPrice from './NpcSellPrice.jsx';
import PriceCell from '../admin/PriceCell.jsx';
import SuggestedActions from '../admin/SuggestedActions.jsx';
import { useAdmin } from '../admin/AdminContext.jsx';
import { OVERCHARGE_LEVEL, OVERCHARGE_PERCENT } from '../utils/prices.js';

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
    title: 'Item name, type and ID',
    className: 'min-w-48',
    render: (item) => (
      <>
        <div className="font-medium text-fg">{item.name}</div>
        <div className="mt-0.5 text-sm text-muted">
          {item.itemType}
          {item.itemId && (
            <>
              {' · '}
              <CopyItemId itemId={item.itemId} />
            </>
          )}
        </div>
      </>
    ),
  },
  {
    label: 'Action',
    sortKey: 'actions',
    title: 'What to do with the item',
    render: (item) => (
      <>
        <div className="flex flex-wrap gap-1">
          <ActionBadges actions={item.actions} />
        </div>
        <SuggestedActions item={item} />
      </>
    ),
  },
  {
    label: 'Category',
    sortKey: 'categories',
    title: 'Where the item is used',
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        <CategoryBadges categories={item.categories} />
      </div>
    ),
  },
  {
    label: 'Used For',
    sortKey: 'uses',
    title: 'What the item is needed for, and how many',
    className: 'min-w-44',
    render: (item, { onSelectUse, highlightUses }) => (
      <ItemUses item={item} onSelectUse={onSelectUse} highlight={highlightUses} />
    ),
  },
  {
    label: 'Vend',
    sortKey: 'avgVend',
    title: 'Average price in player vending shops\n✕ can’t be vended · None: nobody was selling · —: not checked yet',
    numeric: true,
    render: (item) => <PriceCell item={item} field="avgVend" />,
  },
  {
    label: 'Whobuy',
    sortKey: 'avgWhobuy',
    title: 'Average price players pay through @whobuy\n✕ can’t be sold this way · None: nobody was buying · —: not checked yet',
    numeric: true,
    render: (item) => <PriceCell item={item} field="avgWhobuy" />,
  },
  {
    label: 'NPC',
    sortKey: 'npcSellPrice',
    title: `What an NPC pays you, with Overcharge ${OVERCHARGE_LEVEL} (+${OVERCHARGE_PERCENT}%)`,
    numeric: true,
    render: (item) => <NpcSellPrice item={item} />,
  },
  {
    label: 'NPC Shop',
    sortKey: 'npcBuyable',
    numeric: true, // right-aligned, like the price columns
    className: 'w-px', // as narrow as the header text allows
    title: 'Whether NPC shops sell the item',
    render: (item) => <NpcBuyable item={item} />,
  },
  {
    label: 'Verified',
    sortKey: 'lastVerified',
    nowrap: true,
    title: 'When the vend or @whobuy price was last checked in game',
    render: (item) => (
      // isolate keeps the flag's z-30 inside this cell, so it can't cover the sticky header.
      <div className="relative isolate">
        <VerifiedText item={item} />
        <FloatingRowActions item={item} />
      </div>
    ),
  },
];

/**
 * Report Issue, floating over the right of the Verified cell when the row is
 * hovered or focused (always on touch screens, which can't hover). Reports are
 * mostly about prices, so it sits by the "last checked" date, and takes no
 * room. Hidden in admin mode, where you fix things instead of reporting them.
 */
function FloatingRowActions({ item }) {
  const { enabled } = useAdmin();
  if (enabled) return null;
  return (
    <div
      className="absolute -top-1.5 right-0 z-30 rounded-full bg-surface opacity-0 shadow-sm transition-opacity duration-150
        group-hover:opacity-100 focus-within:opacity-100 motion-reduce:transition-none
        [@media(hover:none)]:opacity-100"
    >
      <RowActions item={item} />
    </div>
  );
}

/**
 * Items shown as a table, like the original Google Sheet.
 * Used on wide screens (see ItemList).
 *
 * Props:
 *   items       - items to display (already sorted)
 *   sort        - current sort, e.g. { key: 'avgVend', direction: 'desc' }, or null
 *   onSort      - called with a column's sortKey when its header is clicked
 *   onSelectUse - called when a "Used For" target is clicked
 *   highlightUses - which "Used For" entries to bring forward (see ItemUses)
 */
export default function ItemTable({ items, sort, onSort, onSelectUse, highlightUses }) {
  return (
    <table className="panel w-full border-separate border-spacing-0 text-sm">
      {/* Header rings are drawn inside each cell, so no gap fill around them. */}
      <thead className="[--focus-gap:transparent]">
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
                  ${column.sortKey ? 'p-0' : 'h-11 px-3'}
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
          <ItemRow
            key={item.id}
            item={item}
            onSelectUse={onSelectUse}
            highlightUses={highlightFor(item, highlightUses)}
          />
        ))}
      </tbody>
    </table>
  );
}

/**
 * One table row. Wrapped in `memo` so typing in the search box only redraws
 * rows whose item or highlighting changed, not all ~1,000 of them.
 */
const ItemRow = memo(function ItemRow({ item, onSelectUse, highlightUses }) {
  return (
    <tr className="group even:bg-subtle hover:bg-accent-soft">
      {COLUMNS.map((column) => (
        <td
          key={column.label}
          className={`border-b border-line px-3 py-3 align-top group-last:border-b-0 ${
            column.numeric ? 'text-right whitespace-nowrap tabular-nums' : ''
          } ${column.nowrap ? 'whitespace-nowrap' : ''}`}
        >
          {column.render(item, { onSelectUse, highlightUses })}
        </td>
      ))}
    </tr>
  );
});

/**
 * A column header you can click (or focus and press Enter/Space) to sort.
 * The button fills the whole header cell, so the focus ring outlines the cell.
 * The arrow shows while sorted by this column, or faintly on hover/focus as a
 * hint. Its space is always reserved, so labels don't shift when it appears.
 * It sits on the side away from the column's alignment: after the label in
 * left-aligned columns, before it in right-aligned (number) columns, so the
 * label's edge lines up with the values below.
 */
function SortButton({ column, direction, onSort }) {
  const arrow = (
    <span
      aria-hidden="true"
      className={`w-3 text-center text-xs transition-opacity duration-150 ease-smooth ${
        direction ? 'opacity-100' : 'opacity-0 group-hover/sort:opacity-70 group-focus-visible/sort:opacity-70'
      }`}
    >
      {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}
    </span>
  );

  const button = (
    <button
      type="button"
      onClick={() => onSort(column.sortKey)}
      // The header is dark green, so the focus ring is white and drawn inside the cell.
      // h-11 (44px) matches the filter panel's header height.
      className={`group/sort flex h-11 w-full items-center gap-1 rounded-md px-3 font-semibold
        focus-visible:outline-white focus-visible:-outline-offset-4 ${column.numeric ? 'justify-end' : 'justify-start'}`}
    >
      {column.numeric && arrow}
      {column.label}
      {!column.numeric && arrow}
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
