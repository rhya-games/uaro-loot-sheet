import { useMemo, useState } from 'react';
import { useAdmin } from './useAdmin.js';
import { QUEUES } from './queues.js';
import { useEditingRow } from './useEditingRow.js';
import { confirmChanges } from './verify.js';
import AdminLayout from './AdminLayout.jsx';
import QueueRow, { QueueHeader, QueueSearch } from './QueueRow.jsx';

const PRICE_FIELDS = ['avgVend', 'avgWhobuy'];

/** The prices that are set, and can be changed. */
const fieldsWithPrice = (item) => PRICE_FIELDS.filter((field) => item[field] != null);

/**
 * Admin mode's "Verify prices" queue: items with a price that was never
 * checked in game (no Verified date; see queues.js). For each one, fix any
 * price that changed (type it and press Enter: this only saves the price),
 * then press Confirm. Confirm is what marks the item as checked today, so it
 * leaves the list, and it can follow edits to both prices. From the keyboard,
 * Enter in the last box of a row moves to its Confirm button, and Enter
 * there confirms and moves to the next row.
 *
 * Only exists under `npm run dev`.
 */
export default function VerifyPricesPage() {
  const { items, suggest } = useAdmin();
  const [query, setQuery] = useState('');

  // Looked up here, not at the top of the file, so the published build drops this file entirely.
  const rows = useMemo(() => QUEUES.find((queue) => queue.id === 'unverified-prices').select(items, { suggest }), [items, suggest]);
  const words = query.trim().toLowerCase();
  const matching = words ? rows.filter(({ item }) => item.name.toLowerCase().includes(words)) : rows;
  const { shown, fieldsFor, enter, leave } = useEditingRow(items, matching, fieldsWithPrice);

  return (
    <AdminLayout
      title="Verify prices"
      intro="Prices that were never checked in game. Fix any price that changed (type it and press Enter), then press Confirm. Confirm marks the item as checked today."
    >
      <QueueSearch value={query} onChange={setQuery} />
      <section className="panel overflow-hidden">
        <h2 className="border-b border-line px-4 py-3 font-semibold text-fg">
          {matching.length === rows.length ? `${rows.length} items` : `${matching.length} of ${rows.length} items`}
        </h2>
        {shown.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">{rows.length ? 'No items match.' : 'Every price has been checked in game.'}</p>
        ) : (
          <>
            <QueueHeader action="Verified" />
            <ul>
              {shown.map(({ item }, index) => (
                <QueueRow
                  key={item.id}
                  item={item}
                  fields={fieldsFor(item)}
                  onEnter={() => enter(item, shown[index + 1]?.item.id)}
                  onLeave={() => leave(item.id)}
                  action={<ConfirmButton item={item} />}
                  verifyOnSave={false}
                />
              ))}
            </ul>
          </>
        )}
      </section>
    </AdminLayout>
  );
}

/**
 * Marks the item's prices, as they are now, as checked today. It's the last
 * stop in the row's keyboard order (the price boxes' Enter lands here), and
 * when pressed from the keyboard it moves on to the next row, since this row
 * is about to leave the list.
 */
function ConfirmButton({ item }) {
  const { saveItem } = useAdmin();
  const [status, setStatus] = useState(null); // null | 'saving' | { error }

  async function confirm(event) {
    // A click from the keyboard has no mouse position (detail 0).
    if (event.detail === 0) {
      const stops = [...document.querySelectorAll('[data-advance]')];
      stops[stops.indexOf(event.currentTarget) + 1]?.focus();
    }
    setStatus('saving');
    try {
      await saveItem(item.id, confirmChanges(item), 'Verified');
    } catch (error) {
      setStatus({ error: error.message });
    }
    // On success the row leaves the list, so there's nothing to reset.
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={confirm}
        data-advance="true"
        disabled={status === 'saving'}
        aria-label={`Confirm prices for ${item.name}`}
        className="button-small disabled:opacity-60"
      >
        Confirm
      </button>
      {status?.error && <span className="text-xs text-red-700 dark:text-red-400">{status.error}</span>}
    </div>
  );
}
