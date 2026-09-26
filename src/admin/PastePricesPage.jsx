import { useDeferredValue, useMemo, useState } from 'react';
import { useAdmin } from './useAdmin.js';
import { actionsAfter, parsePriceLines, planPrices } from './pastePrices.js';
import AdminLayout from './AdminLayout.jsx';
import { todayText } from '../utils/format.js';

const EXAMPLE = `7119  780  580
1550  1.2m  -
5162  -    0`;

/** A price as the preview says it: 12000 -> "12,000z", 0 -> "None", null -> "no price". */
const priceText = (zeny) => (zeny == null ? 'no price' : zeny === 0 ? 'None' : `${zeny.toLocaleString('en-US')}z`);
const actionsText = (actions) => (actions.length ? actions.join(' + ') : 'none');

/**
 * Admin mode's "Paste prices": one line per item, "item ID, vend price,
 * @whobuy price" (see pastePrices.js for the format). The preview shows what
 * every line would do before anything is saved. Apply saves them all: each
 * price gets today's Verified date and note, the actions follow the new
 * prices, and one Undo puts the whole paste back.
 *
 * Only exists under `npm run dev`.
 */
export default function PastePricesPage() {
  const { items, targets, saveItems } = useAdmin();
  const [text, setText] = useState('');
  // The preview follows the box a moment later, so typing stays smooth.
  const pasted = useDeferredValue(text);
  const [progress, setProgress] = useState(null); // null | { done, total } | { error }
  const [result, setResult] = useState(null); // { saved, actionsChanged } after applying

  const rows = useMemo(() => planPrices(parsePriceLines(pasted), items, todayText()), [pasted, items]);
  const after = useMemo(() => actionsAfter(rows, items, targets), [rows, items, targets]);
  const ready = rows.filter((row) => row.status === 'ok');
  const skipped = rows.filter((row) => row.status === 'skip').length;
  const unreadable = rows.filter((row) => row.status === 'error').length;
  const applying = progress && !progress.error;

  async function apply() {
    const list = ready.map((row) => ({ id: row.item.id, changes: row.changes }));
    setResult(null);
    setProgress({ done: 0, total: list.length });
    try {
      setResult(await saveItems(list, 'Pasted prices', (done, total) => setProgress({ done, total })));
      setText('');
      setProgress(null);
    } catch (error) {
      setProgress({ error: error.message });
    }
  }

  return (
    <AdminLayout
      title="Paste prices"
      intro="Add many prices at once. One line per item: the item ID, the vend price, then the @whobuy price."
    >
      <section className="panel space-y-3 p-4">
        <label htmlFor="pasted-prices" className="block text-sm font-medium text-fg">
          Prices
        </label>
        <textarea
          id="pasted-prices"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setResult(null);
          }}
          rows={8}
          spellCheck={false}
          placeholder={EXAMPLE}
          className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 font-mono text-sm text-fg placeholder:text-muted"
        />
        <p className="text-sm text-muted">
          Split the columns with spaces, tabs or semicolons. Prices can be written like 12,500, 200k or 1.5m. Type 0 (or none) if nobody is buying, and
          - to leave a price as it is. The last column can be left off.
        </p>
      </section>

      {result && (
        <p role="status" className="panel px-4 py-3 text-sm text-fg">
          Saved {result.saved} item{result.saved === 1 ? '' : 's'}
          {result.actionsChanged ? `, and updated the actions of ${result.actionsChanged}` : ''}. Use Undo at the bottom of the page to put them back.
        </p>
      )}

      {rows.length > 0 && (
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h2 className="font-semibold text-fg">
              {ready.length} to save
              {skipped > 0 && <span className="font-normal text-muted"> · {skipped} skipped</span>}
              {unreadable > 0 && <span className="font-normal text-red-700 dark:text-red-400"> · {unreadable} can't be read</span>}
            </h2>
            <button type="button" onClick={apply} disabled={!ready.length || applying} className="button-small disabled:opacity-60">
              {applying ? `Saving ${progress.done} of ${progress.total}` : `Apply ${ready.length} item${ready.length === 1 ? '' : 's'}`}
            </button>
          </div>
          {progress?.error && <p className="px-4 py-2 text-sm text-red-700 dark:text-red-400">{progress.error}. The items before it were saved.</p>}
          <ul>
            {rows.map((row) => (
              <PreviewRow key={row.number} row={row} newActions={row.status === 'ok' ? after.get(row.item.id) : null} />
            ))}
          </ul>
        </section>
      )}
    </AdminLayout>
  );
}

/**
 * What one pasted line would do.
 *
 * Props:
 *   row        - one entry from planPrices()
 *   newActions - the actions it would end up with, or null if they stay
 */
function PreviewRow({ row, newActions }) {
  const { item } = row;
  return (
    <li className="border-t border-line px-4 py-2 text-sm first:border-t-0">
      <p className="text-fg">
        <span className="text-xs text-muted tabular-nums">Line {row.number}</span>{' '}
        <span className="font-medium">{item ? `${item.name} #${item.itemId}` : row.raw}</span>
      </p>
      {row.status === 'ok' && (
        <>
          <p className="text-muted">
            {Object.entries(row.prices).map(([field, price], index) => (
              <span key={field}>
                {index > 0 && ' · '}
                {field === 'avgVend' ? 'Vend' : 'Whobuy'} {item[field] === price ? `${priceText(price)} (same, verified)` : `${priceText(item[field])} → ${priceText(price)}`}
              </span>
            ))}
          </p>
          {newActions && <p className="text-muted">Actions {actionsText(item.actions)} → {actionsText(newActions)}</p>}
          {row.notes.map((note) => (
            <p key={note} className="text-xs text-muted">{note}</p>
          ))}
        </>
      )}
      {row.status === 'skip' && <p className="text-muted">Skipped: {row.reason}</p>}
      {row.status === 'error' && <p className="text-red-700 dark:text-red-400">{row.reason}</p>}
    </li>
  );
}
