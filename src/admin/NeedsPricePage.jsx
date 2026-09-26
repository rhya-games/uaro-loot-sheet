import { useCallback, useMemo, useState } from 'react';
import { useAdmin } from './useAdmin.js';
import { PriceInput } from './PriceCell.jsx';
import { QUEUES, needsField } from './queues.js';
import AdminLayout from './AdminLayout.jsx';
import CopyItemId from '../components/CopyItemId.jsx';
import { PlayerPrice } from '../components/StatusIcons.jsx';
import { formatZeny } from '../utils/format.js';
import { npcSellPrice } from '../utils/prices.js';

/** How many rows show at once. Priced rows leave the list, so the next ones move up. */
const BATCH = 50;
const PRICE_FIELDS = ['avgVend', 'avgWhobuy'];
/** The columns from tablet width up: item, Vend, Whobuy. */
const COLUMNS = 'md:grid-cols-[1fr_7rem_7rem]';

/**
 * Admin mode's "Needs a price" queue: items with a Vend or Whobuy
 * action and no price yet (see queues.js). Type a price and press Enter: it
 * saves, marks the item verified today, updates its suggested actions, and
 * the cursor moves to the next box. Press Enter on an empty box to skip it.
 * A row leaves the list once it has all its prices. Type 0 for "checked, and
 * nobody's buying".
 *
 * Saving one price can change the actions (a Vend price with no @whobuy
 * price drops Whobuy), which would take the other box away mid-typing. So
 * the row you're in stays, in place and with the boxes it had, until the
 * cursor leaves it.
 *
 * Only exists under `npm run dev`.
 */
export default function NeedsPricePage() {
  const { items, suggest } = useAdmin();
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(BATCH);
  // The row the cursor is in: { id, fields (the boxes it had), beforeId (the row below it) }.
  const [editing, setEditing] = useState(null);
  const startEditing = useCallback((item, beforeId) => {
    setEditing((current) => (current?.id === item.id ? current : { id: item.id, fields: PRICE_FIELDS.filter((field) => needsField(item, field)), beforeId }));
  }, []);
  const stopEditing = useCallback((id) => setEditing((current) => (current?.id === id ? null : current)), []);

  // Looked up here, not at the top of the file, so the published build drops this file entirely.
  const rows = useMemo(() => QUEUES.find((queue) => queue.id === 'needs-price').select(items, { suggest }), [items, suggest]);
  const words = query.trim().toLowerCase();
  const matching = words ? rows.filter(({ item }) => item.name.toLowerCase().includes(words)) : rows;
  let shown = matching.slice(0, limit);
  // The row being edited stays even when it no longer needs a price, in the same place.
  const kept = editing && !shown.some(({ item }) => item.id === editing.id) && items.find((item) => item.id === editing.id);
  if (kept) {
    const at = shown.findIndex(({ item }) => item.id === editing.beforeId);
    shown = at === -1 ? [...shown, { item: kept }] : [...shown.slice(0, at), { item: kept }, ...shown.slice(at)];
  }

  return (
    <AdminLayout
      title="Needs a price"
      intro="Items set to Vend or Whobuy that have no price yet. Type a price and press Enter to save it and move to the next box. Type 0 if nobody is buying."
    >
      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setLimit(BATCH);
        }}
        placeholder="Find an item"
        aria-label="Find an item"
        className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted"
      />
      <section className="panel overflow-hidden">
        <h2 className="border-b border-line px-4 py-3 font-semibold text-fg">
          {matching.length === rows.length ? `${rows.length} items` : `${matching.length} of ${rows.length} items`}
        </h2>
        {shown.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">{rows.length ? 'No items match.' : 'Every item set to Vend or Whobuy has a price.'}</p>
        ) : (
          <>
            <div className={`hidden text-xs text-muted md:grid ${COLUMNS} px-4 py-2`} aria-hidden="true">
              <span>Item</span>
              <span className="text-right">Vend</span>
              <span className="text-right">Whobuy</span>
            </div>
            <ul>
              {shown.map(({ item }, index) => {
                const fields = editing?.id === item.id ? editing.fields : PRICE_FIELDS.filter((field) => needsField(item, field));
                return (
                  <QueueRow
                    key={item.id}
                    item={item}
                    fields={fields}
                    onEnter={() => startEditing(item, shown[index + 1]?.item.id)}
                    onLeave={() => stopEditing(item.id)}
                  />
                );
              })}
            </ul>
          </>
        )}
        {matching.length > shown.length && (
          <div className="border-t border-line px-4 py-3">
            <button type="button" className="button-small" onClick={() => setLimit(limit + BATCH)}>
              Show {Math.min(BATCH, matching.length - shown.length)} more
            </button>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

/**
 * One item: what it is, and a box for each price it needs. On phones the
 * boxes sit under the item; from tablet width up they're columns.
 *
 * Props:
 *   item    - one entry from loot.json
 *   fields  - which prices get a box ("avgVend", "avgWhobuy")
 *   onEnter - the cursor came into the row
 *   onLeave - the cursor left the row (not just moved to another box in it)
 */
function QueueRow({ item, fields, onEnter, onLeave }) {
  return (
    <li
      onFocus={onEnter}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onLeave();
      }}
      className={`grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line px-4 py-3 text-sm md:items-start ${COLUMNS}`}
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
    </li>
  );
}

/** A price box where the price is missing (`editable`); otherwise the price as the loot sheet shows it. */
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
