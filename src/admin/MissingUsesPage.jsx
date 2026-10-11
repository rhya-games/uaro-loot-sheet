import { useMemo, useState } from 'react';
import { useAdmin } from './useAdmin.js';
import { QUEUES } from './queues.js';
import AdminLayout from './AdminLayout.jsx';
import { QueueSearch } from './QueueRow.jsx';
import CopyItemId from '../components/CopyItemId.jsx';
import { ActionBadges } from '../components/ItemBadges.jsx';
import { formatZeny } from '../utils/format.js';
import { npcSellPrice } from '../utils/prices.js';

/** How many rows show at once. */
const BATCH = 50;

/**
 * Admin mode's "Missing uses" queue: items with no uses and no notes that
 * aren't marked No Use (see queues.js). A list to work from: uses and
 * categories can't be edited in admin mode yet, so fix them in loot.json
 * (the add-items skill has the steps) and the row leaves the list.
 *
 * Only exists under `npm run dev`.
 */
export default function MissingUsesPage() {
  const { items, suggest } = useAdmin();
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(BATCH);

  // Looked up here, not at the top of the file, so the published build drops this file entirely.
  const rows = useMemo(() => QUEUES.find((queue) => queue.id === 'missing-uses').select(items, { suggest }), [items, suggest]);
  const words = query.trim().toLowerCase();
  const matching = words ? rows.filter(({ item }) => item.name.toLowerCase().includes(words)) : rows;

  return (
    <AdminLayout
      title="Missing uses"
      intro="Items with no uses and no notes that are not marked No Use. Add what each one is used for, or mark it No Use, in loot.json."
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
        {matching.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">{rows.length ? 'No items match.' : 'Every item has a use or a note.'}</p>
        ) : (
          <ul>
            {matching.slice(0, limit).map(({ item }) => (
              <li key={item.id} className="space-y-1 border-t border-line px-4 py-3 text-sm first:border-t-0">
                <p className="font-medium text-fg">{item.name}</p>
                <p className="text-xs text-muted">
                  <CopyItemId itemId={item.itemId} /> · {item.itemType} · Vend {formatZeny(item.avgVend)} · Whobuy{' '}
                  {formatZeny(item.avgWhobuy)} · NPC {formatZeny(npcSellPrice(item))}
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <ActionBadges actions={item.actions} />
                  {item.categories.map((category) => (
                    <span key={category} className="text-xs text-muted">
                      {category}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
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
