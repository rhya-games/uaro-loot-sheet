import { useMemo, useState } from 'react';
import { useAdmin } from './useAdmin.js';
import { QUEUES, needsField } from './queues.js';
import { useEditingRow } from './useEditingRow.js';
import AdminLayout from './AdminLayout.jsx';
import QueueRow, { QueueHeader, QueueSearch } from './QueueRow.jsx';

/** How many rows show at once. Priced rows leave the list, so the next ones move up. */
const BATCH = 50;
const PRICE_FIELDS = ['avgVend', 'avgWhobuy'];

/** The prices that still need a box. */
const fieldsToFill = (item) => PRICE_FIELDS.filter((field) => needsField(item, field));

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
 * the row you're in stays until the cursor leaves it (see useEditingRow).
 *
 * Only exists under `npm run dev`.
 */
export default function NeedsPricePage() {
  const { items, suggest } = useAdmin();
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(BATCH);

  // Looked up here, not at the top of the file, so the published build drops this file entirely.
  const rows = useMemo(() => QUEUES.find((queue) => queue.id === 'needs-price').select(items, { suggest }), [items, suggest]);
  const words = query.trim().toLowerCase();
  const matching = words ? rows.filter(({ item }) => item.name.toLowerCase().includes(words)) : rows;
  const { shown, fieldsFor, enter, leave } = useEditingRow(items, matching.slice(0, limit), fieldsToFill);

  return (
    <AdminLayout
      title="Needs a price"
      intro="Items set to Vend or Whobuy that have no price yet. Type a price and press Enter to save it and move to the next box. Type 0 if nobody is buying."
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
          <p className="px-4 py-6 text-sm text-muted">{rows.length ? 'No items match.' : 'Every item set to Vend or Whobuy has a price.'}</p>
        ) : (
          <>
            <QueueHeader />
            <ul>
              {shown.map(({ item }, index) => (
                <QueueRow
                  key={item.id}
                  item={item}
                  fields={fieldsFor(item)}
                  onEnter={() => enter(item, shown[index + 1]?.item.id)}
                  onLeave={() => leave(item.id)}
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
