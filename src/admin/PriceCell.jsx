import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAdmin } from './AdminContext.jsx';
import { parseZeny, todayText } from '../utils/format.js';
import { PlayerPrice } from '../components/StatusIcons.jsx';
import { hasWhobuy, isSoldByNpc, isTradeable } from '../utils/prices.js';

/** What the Verified note says for a price checked in game. */
const CHECK_NOTES = {
  avgVend: 'Vend price from a player shop',
  avgWhobuy: '@whobuy price in game',
};

/** What a saved price looks like in the box: 12000 -> "12,000", null -> "". */
const asText = (price) => (price == null ? '' : price.toLocaleString('en-US'));

/**
 * Adds thousands commas to what's typed so far: "12000" -> "12,000",
 * "1500k" -> "1,500k". Only the leading digits change; the rest is kept.
 */
function withCommas(text) {
  const [, digits, rest] = text.replace(/,/g, '').match(/^(\d*)(.*)$/s);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + rest;
}

/**
 * A Vend or Whobuy price cell. In admin mode it's a text box: type a price
 * and press Enter (or leave the box) to save it. That also marks the item
 * as verified today. Escape puts the old price back. 0 means "checked, and
 * nobody was buying (or selling)". Outside admin mode, and where there
 * can't be a price (see PlayerPrice), it's the normal read-only cell.
 *
 * Props:
 *   item  - one entry from loot.json
 *   field - "avgVend" or "avgWhobuy"
 */
export default function PriceCell({ item, field }) {
  const { enabled } = useAdmin();
  const noPrice = !isTradeable(item) || isSoldByNpc(item) || (field === 'avgWhobuy' && !hasWhobuy(item));
  if (!enabled || noPrice) return <PlayerPrice item={item} field={field} />;
  return <PriceInput item={item} field={field} />;
}

function PriceInput({ item, field }) {
  const { saveItem } = useAdmin();
  const saved = item[field];
  const [text, setText] = useState(asText(saved));
  const [status, setStatus] = useState(null); // null | 'saving' | { error }
  const inputRef = useRef(null);
  const caret = useRef(null); // where the cursor goes after commas are added

  // Show the new value after a save.
  useEffect(() => setText(asText(saved)), [saved]);

  // Adding commas moves the text around, so put the cursor back after the
  // same number of typed characters (commas don't count).
  function onChange(event) {
    const { value: typed, selectionStart } = event.target;
    const before = typed.slice(0, selectionStart).replace(/,/g, '').length;
    const formatted = withCommas(typed);
    let position = 0;
    for (let seen = 0; position < formatted.length && seen < before; position++) {
      if (formatted[position] !== ',') seen++;
    }
    caret.current = position;
    setText(formatted);
  }
  useLayoutEffect(() => {
    if (caret.current == null) return;
    inputRef.current?.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [text]);

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
        ref={inputRef}
        onChange={onChange}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
          if (event.key === 'Escape') {
            event.preventDefault(); // Escape is handled here; see AGENTS.md.
            setText(asText(saved));
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
      {value > 0 && text.trim() !== asText(value) && <span className="text-xs text-muted">{asText(value)}z</span>}
      {value === 0 && <span className="text-xs text-muted">{field === 'avgWhobuy' ? 'No buyers' : 'No sellers'}</span>}
      {status?.error && <span className="text-xs text-red-700 dark:text-red-400">{status.error}</span>}
    </div>
  );
}
