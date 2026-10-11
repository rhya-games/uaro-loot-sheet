import { useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { PriceInput } from './PriceCell.jsx';
import { useAdmin } from './useAdmin.js';
import { priceChanges } from './verify.js';
import Tooltip from '../components/Tooltip.jsx';
import CopyItemId from '../components/CopyItemId.jsx';
import { PlayerPrice } from '../components/StatusIcons.jsx';
import { formatZeny } from '../utils/format.js';
import { npcSellPrice } from '../utils/prices.js';
import { canHavePrice } from './queues.js';

/** The columns from tablet width up: item, Vend, Whobuy, and a button if the queue has one. */
// 8rem fits the 6rem price box, the None button beside it, and a little air.
const COLUMNS = 'md:grid-cols-[1fr_8rem_8rem]';
const COLUMNS_WITH_ACTION = 'md:grid-cols-[1fr_8rem_8rem_6rem]';

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
    // gap-x-3 like the rows below, or the columns drift out of line with the boxes.
    <div className={`hidden gap-x-3 text-xs text-muted md:grid ${action ? COLUMNS_WITH_ACTION : COLUMNS} px-4 py-2`} aria-hidden="true">
      <span>Item</span>
      {/* Left-aligned, like the boxes under them. */}
      <span>Vend</span>
      <span>Whobuy</span>
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
 *   detail  - more under the item's uses, such as why it is listed (optional)
 *   verifyOnSave - whether saving a price also marks the item verified today
 *             (default). Verify prices turns it off: its Confirm button does that.
 */
export default function QueueRow({ item, fields, onEnter, onLeave, action, detail, verifyOnSave = true }) {
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
        {detail}
      </div>
      <PriceCell item={item} field="avgVend" label="Vend" command="@ws" editable={fields.includes('avgVend')} verify={verifyOnSave} />
      <PriceCell item={item} field="avgWhobuy" label="Whobuy" command="@wb" editable={fields.includes('avgWhobuy')} verify={verifyOnSave} />
      {action && <div className="col-span-2 flex justify-end md:col-span-1">{action}</div>}
    </li>
  );
}

/**
 * A price box (`editable`); otherwise the price as the loot sheet shows it.
 * Under it, a button that copies the in-game chat command for that price
 * ("@ws 969" looks up vendors, "@wb 969" buyers), for prices that can exist.
 */
function PriceCell({ item, field, label, command, editable, verify }) {
  return (
    // On phones the label sits above its box: side by side, the box, the None
    // button and the label don't fit in half the row.
    <div className="flex flex-col items-start gap-1">
      <span className="text-xs text-muted md:hidden">{label}</span>
      <div className="flex flex-col items-start gap-1">
        {editable ? (
          <div className="flex items-start gap-1">
            <PriceInput item={item} field={field} advance verify={verify} />
            {/* Whobuy only: most items nobody is buying, so it's one click instead of typing 0. */}
            {field === 'avgWhobuy' && <NoneButton item={item} field={field} verify={verify} />}
          </div>
        ) : (
          <PlayerPrice item={item} field={field} />
        )}
        {canHavePrice(item, field) && (
          <span className="text-xs text-muted">
            <CopyItemId itemId={item.itemId} command={command} />
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Saves the price as 0, which the sheet shows as "None" (checked, and nobody
 * is buying). Not part of the Enter-key order: the box and Done are.
 */
function NoneButton({ item, field, verify }) {
  const { saveItem } = useAdmin();
  const [saving, setSaving] = useState(false);
  const isNone = item[field] === 0;

  async function markNone() {
    setSaving(true);
    try {
      await saveItem(item.id, verify ? priceChanges(item, { [field]: 0 }) : { [field]: 0 });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Tooltip text={isNone ? 'Already None' : 'Mark as None: nobody is buying'}>
      <button
        type="button"
        onClick={markNone}
        disabled={saving || isNone}
        aria-label={`Mark whobuy price for ${item.name} as None`}
        className="mt-px rounded-md p-1 text-muted hover:text-fg disabled:opacity-40"
      >
        <XCircleIcon className="size-5" aria-hidden="true" />
      </button>
    </Tooltip>
  );
}

/** "Used for: Lazy Smokie ×1000, Nutters Repeatable Quest ×25 and 2 more", or "Not used for anything". */
function usesText(item) {
  if (!item.uses.length) return 'Not used for anything';
  const parts = item.uses.slice(0, 3).map((use) => (use.qty > 1 ? `${use.for} ×${use.qty}` : use.for));
  const more = item.uses.length - parts.length;
  return `Used for: ${parts.join(', ')}${more > 0 ? ` and ${more} more` : ''}`;
}
