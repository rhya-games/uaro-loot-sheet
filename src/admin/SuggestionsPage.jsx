import { useMemo, useState } from 'react';
import { useAdmin } from './useAdmin.js';
import { QUEUES, isReviewed } from './queues.js';
import AdminLayout from './AdminLayout.jsx';
import { QueueSearch } from './QueueRow.jsx';
import CopyItemId from '../components/CopyItemId.jsx';
import { ActionBadges } from '../components/ItemBadges.jsx';
import { formatZeny } from '../utils/format.js';
import { npcSellPrice } from '../utils/prices.js';

/** How many rows show at once. Handled rows leave the list, so the next ones move up. */
const BATCH = 50;
/** How many of an item's reasons show before "and N more". */
const REASONS_SHOWN = 3;

/**
 * Admin mode's "Suggestion differs" queue: items whose suggested actions
 * (src/utils/suggest.js) aren't the ones set by hand, grouped by the change
 * ("Vend → NPC"), biggest group first. For each item:
 *   - Use suggestion: sets the suggested actions (undo brings them back).
 *   - Keep mine: the hand-set actions are right. The item stays out of the
 *     list until its actions or its suggestion change (see queues.js
 *     isReviewed), and shows under "Kept as they are", where it can be
 *     reviewed again.
 *
 * Only exists under `npm run dev`.
 */
export default function SuggestionsPage() {
  const { items, suggest, reviewed, removeReviewed } = useAdmin();
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(BATCH);

  // Looked up here, not at the top of the file, so the published build drops this file entirely.
  const rows = useMemo(
    () => QUEUES.find((queue) => queue.id === 'suggestion-differs').select(items, { suggest, reviewed }),
    [items, suggest, reviewed],
  );
  const words = query.trim().toLowerCase();
  const matching = words ? rows.filter(({ item }) => item.name.toLowerCase().includes(words)) : rows;

  // Rows come sorted by change, so each group is a run of rows. Its count is for the whole list.
  const groupSizes = useMemo(() => {
    const sizes = new Map();
    for (const row of rows) sizes.set(row.pattern, (sizes.get(row.pattern) ?? 0) + 1);
    return sizes;
  }, [rows]);
  const groups = [];
  for (const row of matching.slice(0, limit)) {
    if (groups.at(-1)?.pattern === row.pattern) groups.at(-1).rows.push(row);
    else groups.push({ pattern: row.pattern, rows: [row] });
  }

  // Reviews that still apply, for the "Kept as they are" list. The others are back in the list above.
  const kept = useMemo(() => {
    const list = [];
    for (const entry of reviewed.values()) {
      const item = items.find((candidate) => candidate.id === entry.id);
      if (item && isReviewed(entry, item, suggest(item).actions)) list.push({ item, entry });
    }
    return list.sort((a, b) => a.item.name.localeCompare(b.item.name));
  }, [items, suggest, reviewed]);

  return (
    <AdminLayout
      title="Suggestion differs"
      intro="Items where the suggested actions are not the ones set by hand. Use the suggestion, or press Keep mine if your actions are right. A kept item comes back if its actions or its suggestion change."
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
        {groups.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted">{rows.length ? 'No items match.' : 'Every suggestion matches, or was kept.'}</p>
        )}
        {groups.map((group) => (
          <div key={group.pattern}>
            <h3 className="border-t border-line bg-hover px-4 py-2 text-sm font-semibold text-fg">
              {group.pattern} <span className="font-normal text-muted">{groupSizes.get(group.pattern)} items</span>
            </h3>
            <ul>
              {group.rows.map((row) => (
                <SuggestionRow key={row.item.id} item={row.item} suggested={row.suggested} reasons={suggest(row.item).reasons} />
              ))}
            </ul>
          </div>
        ))}
        {matching.length > limit && (
          <div className="border-t border-line px-4 py-3">
            <button type="button" className="button-small" onClick={() => setLimit(limit + BATCH)}>
              Show {Math.min(BATCH, matching.length - limit)} more
            </button>
          </div>
        )}
      </section>

      {kept.length > 0 && (
        <section className="panel overflow-hidden">
          <h2 className="border-b border-line px-4 py-3 font-semibold text-fg">Kept as they are ({kept.length})</h2>
          <ul>
            {kept.map(({ item, entry }) => (
              <li key={item.id} className="flex items-center justify-between gap-3 border-t border-line px-4 py-2 text-sm first:border-t-0">
                <div>
                  <p className="font-medium text-fg">{item.name}</p>
                  <p className="text-xs text-muted">Kept {entry.actions.join(' + ') || 'no action'}; suggested {entry.suggested.join(' + ')}</p>
                </div>
                <ActionButton label="Review again" ariaLabel={`Review ${item.name} again`} onClick={() => removeReviewed(item)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </AdminLayout>
  );
}

/**
 * One item: what it is and why the suggestion differs, with the two buttons.
 *
 * Props:
 *   item      - one entry from loot.json
 *   suggested - the suggested actions
 *   reasons   - the suggester's plain-language reasons (the first few show)
 */
function SuggestionRow({ item, suggested, reasons }) {
  const { saveItem, saveReviewed } = useAdmin();
  const shownReasons = reasons.slice(0, REASONS_SHOWN);
  const more = reasons.length - shownReasons.length;

  return (
    <li className="flex flex-col gap-3 border-t border-line px-4 py-3 text-sm md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="font-medium text-fg">{item.name}</p>
        <p className="text-xs text-muted">
          <CopyItemId itemId={item.itemId} /> · Vend {formatZeny(item.avgVend)} · Whobuy {formatZeny(item.avgWhobuy)} · NPC {formatZeny(npcSellPrice(item))}
        </p>
        <p className="flex flex-wrap items-center gap-1">
          <ActionBadges actions={item.actions} />
          <span aria-label="should be" className="text-muted">→</span>
          <ActionBadges actions={suggested} />
        </p>
        <ul className="text-xs text-muted">
          {shownReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
          {more > 0 && <li>and {more} more</li>}
        </ul>
      </div>
      <div className="flex shrink-0 gap-2">
        <ActionButton
          label="Use suggestion"
          ariaLabel={`Use suggested actions for ${item.name}`}
          onClick={() => saveItem(item.id, { actions: suggested }, `actions ${item.actions.join(' + ') || 'none'} → ${suggested.join(' + ')}`)}
        />
        <ActionButton label="Keep mine" ariaLabel={`Keep the actions of ${item.name}`} onClick={() => saveReviewed(item, suggested)} />
      </div>
    </li>
  );
}

/**
 * A small button that runs an async action, dims while it runs, and shows
 * the error if it fails. On success the row usually leaves the list, so
 * there's nothing to reset.
 */
function ActionButton({ label, ariaLabel, onClick }) {
  const [status, setStatus] = useState(null); // null | 'saving' | { error }

  async function run() {
    setStatus('saving');
    try {
      await onClick();
      setStatus(null);
    } catch (error) {
      setStatus({ error: error.message });
    }
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button type="button" onClick={run} disabled={status === 'saving'} aria-label={ariaLabel} className="button-small disabled:opacity-60">
        {label}
      </button>
      {status?.error && <span className="text-xs text-red-700 dark:text-red-400">{status.error}</span>}
    </span>
  );
}
