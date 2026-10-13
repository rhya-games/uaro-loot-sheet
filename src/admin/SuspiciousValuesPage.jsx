import { useMemo, useState } from 'react';
import { useAdmin } from './useAdmin.js';
import { QUEUES } from './queues.js';
import { useEditingRow } from './useEditingRow.js';
import AdminLayout from './AdminLayout.jsx';
import QueueRow, { QueueHeader, QueueSearch } from './QueueRow.jsx';
import { ActionBadges } from '../components/ItemBadges.jsx';

const PRICE_FIELDS = ['avgVend'];

/** The prices that are set, and can be fixed. */
const fieldsWithPrice = (item) => PRICE_FIELDS.filter((field) => item[field] != null);

/**
 * Admin mode's "Suspicious values" queue: numbers or actions that don't fit
 * together (see queues.js). Each row says why it is here and shows the item's
 * actions. A price that is wrong can be fixed in place: type it and press
 * Enter, which saves it and marks it checked today. Wrong actions are fixed
 * on the Suggestion differs page, which offers the suggested ones.
 *
 * A row leaves the list when nothing is suspicious about it any more.
 *
 * Only exists under `npm run dev`.
 */
export default function SuspiciousValuesPage() {
  const { items, suggest } = useAdmin();
  const [query, setQuery] = useState('');

  // Looked up here, not at the top of the file, so the published build drops this file entirely.
  const rows = useMemo(() => QUEUES.find((queue) => queue.id === 'suspicious-values').select(items, { suggest }), [items, suggest]);
  const reasons = useMemo(() => new Map(rows.map((row) => [row.item.id, row.reasons])), [rows]);
  const words = query.trim().toLowerCase();
  const matching = words ? rows.filter(({ item }) => item.name.toLowerCase().includes(words)) : rows;
  const { shown, fieldsFor, enter, leave } = useEditingRow(items, matching, fieldsWithPrice);

  return (
    <AdminLayout
      title="Suspicious values"
      intro="Numbers or actions that do not fit together. Fix a wrong price here: type it and press Enter. For a wrong action, use the Suggestion differs page."
    >
      <QueueSearch value={query} onChange={setQuery} />
      <section className="panel overflow-hidden">
        <h2 className="border-b border-line px-4 py-3 font-semibold text-fg">
          {matching.length === rows.length ? `${rows.length} items` : `${matching.length} of ${rows.length} items`}
        </h2>
        {shown.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">{rows.length ? 'No items match.' : 'Nothing looks wrong.'}</p>
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
                  detail={
                    <div className="mt-1 space-y-1">
                      <p className="flex flex-wrap items-center gap-1">
                        <ActionBadges actions={item.actions} />
                      </p>
                      <ul className="text-xs text-body">
                        {(reasons.get(item.id) ?? []).map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  }
                />
              ))}
            </ul>
          </>
        )}
      </section>
    </AdminLayout>
  );
}
