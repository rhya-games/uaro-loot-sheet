import { useMemo, useState } from 'react';
import { useAdmin } from './useAdmin.js';
import { QUEUES, canHavePrice } from './queues.js';
import AdminLayout from './AdminLayout.jsx';
import QueueRow, { QueueHeader, QueueSearch } from './QueueRow.jsx';

/** How many rows show at once. */
const BATCH = 50;
const PRICE_FIELDS = ['avgVend', 'avgWhobuy'];

/** Every price the item can have gets a box, filled or not, so a price can be fixed in place. */
const fieldsOf = (item) => PRICE_FIELDS.filter((field) => canHavePrice(item, field));

/**
 * Admin mode's "Needs a price" queue: items with a Vend or Whobuy
 * action, or no action yet, and no price (see queues.js). Type a price and
 * press Enter: it saves, marks the item verified today, updates its suggested
 * actions, and the cursor moves to the next box. Press Enter on an empty box
 * to skip it.
 *
 * A row never leaves by itself: once priced it stays (with its prices in
 * the boxes, and its action updated) until you press its Done button, so a
 * save can't take the other box away mid-typing. Enter on the last box
 * lands on Done; pressing it moves on to the next row.
 *
 * Only exists under `npm run dev`.
 */
export default function NeedsPricePage() {
  const { items, suggest } = useAdmin();
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(BATCH);
  // Every item that has been in the queue this visit, in the order it first
  // appeared, so a row stays where it was after it's priced. `done` holds
  // the ones sent away with their button.
  const [seen, setSeen] = useState([]);
  const [done, setDone] = useState(() => new Set());

  // Looked up here, not at the top of the file, so the published build drops this file entirely.
  const queued = useMemo(() => QUEUES.find((queue) => queue.id === 'needs-price').select(items, { suggest }), [items, suggest]);
  if (queued.some(({ item }) => !seen.includes(item.id))) {
    setSeen([...seen, ...queued.map(({ item }) => item.id).filter((id) => !seen.includes(id))]);
  }

  const rows = useMemo(() => {
    const byId = new Map(items.map((item) => [item.id, item]));
    return seen.filter((id) => !done.has(id) && byId.has(id)).map((id) => byId.get(id));
  }, [items, seen, done]);
  const words = query.trim().toLowerCase();
  const matching = words ? rows.filter((item) => item.name.toLowerCase().includes(words)) : rows;
  const shown = matching.slice(0, limit);

  return (
    <AdminLayout
      title="Needs a price"
      intro="Items set to Vend or Whobuy, or with no action yet, that have no price yet. Type a price and press Enter to save it and move to the next box. Type 0 if nobody is buying. A row stays until you press Done."
    >
      <QueueSearch
        value={query}
        onChange={(text) => {
          setQuery(text);
          setLimit(BATCH);
        }}
      />
      <section className="panel overflow-hidden">
        <h2 className="border-b border-line px-4 py-3 font-semibold text-fg">
          {matching.length === rows.length ? `${rows.length} items` : `${matching.length} of ${rows.length} items`}
        </h2>
        {shown.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">{rows.length ? 'No items match.' : 'Every item that needs a price has one.'}</p>
        ) : (
          <>
            <QueueHeader action="Done" />
            <ul>
              {shown.map((item) => (
                <QueueRow
                  key={item.id}
                  item={item}
                  fields={fieldsOf(item)}
                  action={<DoneButton item={item} onDone={() => setDone((current) => new Set(current).add(item.id))} />}
                />
              ))}
            </ul>
          </>
        )}
        {matching.length > limit && (
          <div className="border-t border-line px-4 py-3">
            <button type="button" className="button-small" onClick={() => setLimit(limit + BATCH)}>
              Show {Math.min(BATCH, matching.length - limit)} more
            </button>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

/**
 * Sends the row away. It's the last stop in the row's keyboard order (the
 * price boxes' Enter lands here); pressed from the keyboard it first moves
 * the cursor to the next row's first box, since this row is about to go.
 */
function DoneButton({ item, onDone }) {
  function done(event) {
    // A click from the keyboard has no mouse position (detail 0).
    if (event.detail === 0) {
      const stops = [...document.querySelectorAll('[data-advance]')];
      stops[stops.indexOf(event.currentTarget) + 1]?.focus();
    }
    onDone();
  }
  return (
    <button type="button" onClick={done} data-advance="true" aria-label={`Done with ${item.name}`} className="button-small">
      Done
    </button>
  );
}
