import { useEffect, useState } from 'react';
import { useAdmin } from './AdminContext.jsx';
import { parseZeny, todayText } from '../utils/format.js';
import { PlayerPrice } from '../components/StatusIcons.jsx';
import { isSoldByNpc, isTradeable } from '../utils/prices.js';

/** What the Verified note says for a price checked in game. */
const CHECK_NOTES = {
  avgVend: 'Vend price from a player shop',
  avgWhobuy: '@whobuy price in game',
};

/**
 * A Vend or Whobuy price cell. In admin mode it's a text box: type a price
 * and press Enter (or leave the box) to save it. That also marks the item
 * as verified today. Escape puts the old price back. Outside admin mode, and
 * for items players don't trade, it's the normal read-only price.
 *
 * Props:
 *   item  - one entry from loot.json
 *   field - "avgVend" or "avgWhobuy"
 */
export default function PriceCell({ item, field }) {
  const { enabled } = useAdmin();
  if (!enabled || !isTradeable(item) || isSoldByNpc(item)) return <PlayerPrice item={item} field={field} />;
  return <PriceInput item={item} field={field} />;
}

function PriceInput({ item, field }) {
  const { saveItem } = useAdmin();
  const saved = item[field];
  const [text, setText] = useState(saved == null ? '' : String(saved));
  const [status, setStatus] = useState(null); // null | 'saving' | { error }

  // Show the new value when the data reloads after a save.
  useEffect(() => setText(saved == null ? '' : String(saved)), [saved]);

  const value = parseZeny(text);
  const invalid = value === undefined;

  async function save() {
    if (invalid || value === saved) return;
    // Clearing a price isn't a check in game, so it doesn't touch Verified.
    const changes = { [field]: value };
    if (value != null) {
      const note = CHECK_NOTES[field];
      const earlierToday = item.lastVerified === todayText() && item.verificationNotes && !item.verificationNotes.includes(note);
      Object.assign(changes, {
        lastVerified: todayText(),
        verificationNotes: earlierToday ? `${item.verificationNotes}; ${note}` : note,
      });
    }
    setStatus('saving');
    try {
      await saveItem(item.id, changes);
      setStatus(null);
    } catch (error) {
      setStatus({ error: error.message });
    }
  }

  const label = `${field === 'avgVend' ? 'Vend' : 'Whobuy'} price for ${item.name}`;
  return (
    <div className="flex flex-col items-end gap-1">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
          if (event.key === 'Escape') {
            event.preventDefault(); // Escape is handled here; see AGENTS.md.
            setText(saved == null ? '' : String(saved));
          }
        }}
        placeholder="—"
        aria-label={label}
        aria-invalid={invalid || undefined}
        className={`w-24 rounded-md border bg-surface px-2 py-1 text-right tabular-nums text-fg
          placeholder:text-muted ${invalid || status?.error ? 'border-red-600' : 'border-line'}
          ${status === 'saving' ? 'opacity-60' : ''}`}
      />
      {/* Typed "12k"? Show what it means. */}
      {value != null && text.trim() !== String(value) && <span className="text-xs text-muted">{value.toLocaleString('en-US')}z</span>}
      {status?.error && <span className="text-xs text-red-700 dark:text-red-400">{status.error}</span>}
    </div>
  );
}
