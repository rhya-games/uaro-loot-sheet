import { useLayoutEffect, useRef, useState } from 'react';
import { parseZeny } from '../utils/format.js';

/** What a saved amount looks like in the box: 12000 -> "12,000", 0 -> "None", null -> "". */
const asText = (zeny) => (zeny == null ? '' : zeny === 0 ? 'None' : zeny.toLocaleString('en-US'));

/**
 * Adds thousands commas to what's typed so far: "12000" -> "12,000",
 * "1500k" -> "1,500k". Only the leading digits change; the rest is kept.
 */
function withCommas(text) {
  const [, digits, rest] = text.replace(/,/g, '').match(/^(\d*)(.*)$/s);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + rest;
}

/**
 * A text box for a zeny amount, used by admin mode's price cells and the
 * Targets page. Commas appear while typing, and shorthand works ("1.5m",
 * "200k"). Enter (or leaving the box) saves, and Escape puts the old
 * amount back. 0 (or "none") shows as "None"; empty means "not set".
 *
 * Props:
 *   value    - the saved amount (a number, 0, or null)
 *   onSave   - async (newValue) => void; throw to show an error
 *   label    - the box's accessible name
 *   noneHint - what "None" means here, shown after typing 0
 *   advance  - Enter moves to the next box that also has `advance` (for
 *              typing down a list of prices), instead of just leaving this one
 */
export default function ZenyInput({ value: saved, onSave, label, noneHint, advance = false }) {
  const [text, setText] = useState(asText(saved));
  const [status, setStatus] = useState(null); // null | 'saving' | { error }
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const caret = useRef(null); // where the cursor goes after commas are added

  // Show the new value after a save (set while drawing, React's way to follow a prop).
  const [shownSaved, setShownSaved] = useState(saved);
  if (saved !== shownSaved) {
    setShownSaved(saved);
    setText(asText(saved));
  }

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
    setStatus('saving');
    try {
      await onSave(value);
      setStatus(null);
    } catch (error) {
      setStatus({ error: error.message });
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        ref={inputRef}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          save();
        }}
        data-advance={advance || undefined}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            // Leaving the box saves it. With `advance`, the next such box gets the cursor.
            const boxes = advance ? [...document.querySelectorAll('[data-advance]')] : [];
            const next = boxes[boxes.indexOf(event.currentTarget) + 1];
            if (next) next.focus();
            else event.currentTarget.blur();
          }
          if (event.key === 'Escape') {
            event.preventDefault(); // Escape is handled here; see AGENTS.md.
            setText(asText(saved));
          }
        }}
        // Empty means "not set"; while typing, hint that shorthand works.
        placeholder={focused ? 'e.g. 1.5m' : '—'}
        aria-label={label}
        aria-invalid={invalid || undefined}
        className={`w-24 rounded-md border bg-surface px-2 py-1 text-right tabular-nums text-fg
          placeholder:text-muted ${invalid || status?.error ? 'border-red-600' : 'border-line'}
          ${status === 'saving' ? 'opacity-60' : ''}`}
      />
      {/* Typed "12k"? Show what it means. */}
      {value > 0 && text.trim() !== asText(value) && <span className="text-xs text-muted">{asText(value)}z</span>}
      {/* Typed 0? It saves as "None". */}
      {value === 0 && text.trim().toLowerCase() !== 'none' && (
        <span className="text-xs text-muted">None: {noneHint}</span>
      )}
      {status?.error && <span className="text-xs text-red-700 dark:text-red-400">{status.error}</span>}
    </div>
  );
}
