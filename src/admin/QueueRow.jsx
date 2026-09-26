import { PriceInput } from './PriceCell.jsx';
import CopyItemId from '../components/CopyItemId.jsx';
import { PlayerPrice } from '../components/StatusIcons.jsx';
import { formatZeny } from '../utils/format.js';
import { npcSellPrice } from '../utils/prices.js';

/** The columns from tablet width up: item, Vend, Whobuy, and a button if the queue has one. */
const COLUMNS = 'md:grid-cols-[1fr_7rem_7rem]';
const COLUMNS_WITH_ACTION = 'md:grid-cols-[1fr_7rem_7rem_6rem]';

/**
 * The parts the price queues (Needs a price, Verify prices) share: a search
 * box, the column headings, and one row per item with a box for each price.
 */

/** A box to find an item in the list by name. */
export function QueueSearch({ value, onChange }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Find an item"
      aria-label="Find an item"
      className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted"
    />
  );
}

/** Column headings, from tablet width up (phones label each box instead). `action` is the last column's heading, if any. */
export function QueueHeader({ action }) {
  return (
    <div className={`hidden text-xs text-muted md:grid ${action ? COLUMNS_WITH_ACTION : COLUMNS} px-4 py-2`} aria-hidden="true">
      <span>Item</span>
      <span className="text-right">Vend</span>
      <span className="text-right">Whobuy</span>
      {action && <span className="text-right">{action}</span>}
    </div>
  );
}

/**
 * One item: what it is, and a box for each price in `fields`. On phones the
 * boxes sit under the item; from tablet width up they're columns.
 *
 * Props:
 *   item    - one entry from loot.json
 *   fields  - which prices get a box ("avgVend", "avgWhobuy")
 *   onEnter - the cursor came into a box in the row
 *   onLeave - the cursor left the row (not just moved to another box in it)
 *   action  - a button for the last column (optional)
 */
export default function QueueRow({ item, fields, onEnter, onLeave, action }) {
  return (
    <li
      // Only boxes count: clicking the row's button shouldn't keep the row on screen.
      onFocus={(event) => event.target.matches('input') && onEnter()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onLeave();
      }}
      className={`grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line px-4 py-3 text-sm md:items-start ${action ? COLUMNS_WITH_ACTION : COLUMNS}`}
    >
      <div className="col-span-2 md:col-span-1">
        <p className="font-medium text-fg">{item.name}</p>
        <p className="text-xs text-muted">
          <CopyItemId itemId={item.itemId} /> · {item.itemType} · NPC {formatZeny(npcSellPrice(item))}
        </p>
        <p className="text-xs text-muted">{usesText(item)}</p>
      </div>
      <PriceCell item={item} field="avgVend" label="Vend" editable={fields.includes('avgVend')} />
      <PriceCell item={item} field="avgWhobuy" label="Whobuy" editable={fields.includes('avgWhobuy')} />
      {action && <div className="col-span-2 flex justify-end md:col-span-1">{action}</div>}
    </li>
  );
}

/** A price box (`editable`); otherwise the price as the loot sheet shows it. */
function PriceCell({ item, field, label, editable }) {
  return (
    <div className="flex items-start justify-between gap-2 md:justify-end">
      <span className="text-xs text-muted md:hidden">{label}</span>
      {editable ? <PriceInput item={item} field={field} advance /> : <PlayerPrice item={item} field={field} />}
    </div>
  );
}

/** "Used for: Lazy Smokie ×1000, Nutters Repeatable Quest ×25 and 2 more", or "Not used for anything". */
function usesText(item) {
  if (!item.uses.length) return 'Not used for anything';
  const parts = item.uses.slice(0, 3).map((use) => (use.qty > 1 ? `${use.for} ×${use.qty}` : use.for));
  const more = item.uses.length - parts.length;
  return `Used for: ${parts.join(', ')}${more > 0 ? ` and ${more} more` : ''}`;
}
