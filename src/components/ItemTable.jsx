import { ActionBadges, CategoryBadges } from './ItemBadges.jsx';
import ItemUses from './ItemUses.jsx';
import { NPC_BUYABLE_LABELS } from '../utils/labels.js';
import { formatZeny } from '../utils/format.js';

/**
 * Table columns, in display order. To add a column, add an entry here.
 *
 *   label     - header text
 *   title     - optional header tooltip
 *   numeric   - right-align (for numbers)
 *   className - extra classes for the column (e.g. width)
 *   render    - how to show the value for one item: (item, handlers) => ...
 */
const COLUMNS = [
  {
    label: 'Item Name',
    render: (item) => (
      <>
        <div className="font-medium text-gray-900">{item.name}</div>
        <div className="text-xs text-gray-400">
          {item.itemType}
          {item.itemId && ` · #${item.itemId}`}
        </div>
      </>
    ),
  },
  {
    label: 'Action',
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        <ActionBadges actions={item.actions} />
      </div>
    ),
  },
  {
    label: 'Category',
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        <CategoryBadges categories={item.categories} />
      </div>
    ),
  },
  {
    label: 'Used For',
    className: 'min-w-56',
    render: (item, { onSelectUse }) => <ItemUses item={item} onSelectUse={onSelectUse} />,
  },
  {
    label: 'Vend',
    title: 'Average price in player vending shops',
    numeric: true,
    render: (item) => formatZeny(item.avgVend),
  },
  {
    label: 'Whobuy',
    title: 'Average price players pay through @whobuy',
    numeric: true,
    render: (item) => formatZeny(item.avgWhobuy),
  },
  {
    label: 'NPC Sell',
    title: 'Zeny from selling to an NPC with Overcharge level 10',
    numeric: true,
    render: (item) => formatZeny(item.npcSellPrice),
  },
  {
    label: 'NPC Buy',
    title: 'Can you buy this from an NPC?',
    render: (item) => NPC_BUYABLE_LABELS[item.npcBuyable] ?? '—',
  },
  {
    label: 'Verified',
    title: 'Date this entry was last checked on the live server',
    render: (item) => (
      <span title={item.verificationNotes || undefined}>{item.lastVerified ?? 'Never'}</span>
    ),
  },
];

/**
 * Items shown as a table, like the original Google Sheet.
 * Used on wide screens (see ItemList).
 *
 * Props:
 *   items       - items to display
 *   onSelectUse - called when a "Used For" target is clicked
 */
export default function ItemTable({ items, onSelectUse }) {
  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr>
          {COLUMNS.map((column) => (
            <th
              key={column.label}
              scope="col"
              title={column.title}
              className={`sticky top-0 z-10 bg-emerald-800 px-2 py-2 font-semibold whitespace-nowrap text-white
                first:rounded-tl-lg last:rounded-tr-lg ${column.numeric ? 'text-right' : 'text-left'} ${column.className ?? ''}`}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white">
        {items.map((item) => (
          <tr key={item.id} className="even:bg-gray-50 hover:bg-emerald-50">
            {COLUMNS.map((column) => (
              <td
                key={column.label}
                className={`border-b border-gray-200 px-2 py-2 align-top ${
                  column.numeric ? 'text-right whitespace-nowrap tabular-nums' : ''
                }`}
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
