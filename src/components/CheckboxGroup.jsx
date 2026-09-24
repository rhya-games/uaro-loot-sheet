import { useEffect, useRef, useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * A titled, collapsible list of checkboxes with a count next to each option.
 * Options with no matching items are dimmed (but stay clickable if checked).
 *
 * Props:
 *   title       - group heading, e.g. "Category"
 *   options     - array of option values (strings)
 *   counts      - Map of option -> number of matching items
 *   selected    - array of checked option values
 *   onToggle    - called with an option value when it's clicked
 *   renderLabel - optional: (option) => what to show instead of plain text
 *   searchable  - optional: for long lists. Adds a search box, hides options
 *                 with no matches, and lists checked options first.
 *   onSetAll    - optional: adds a "Select all" checkbox. Called with the new
 *                 list of checked options (all of them, or none).
 *   selectAllLabel - text for that checkbox, e.g. "Select all categories"
 */
export default function CheckboxGroup({
  title,
  options,
  counts,
  selected,
  onToggle,
  renderLabel,
  searchable = false,
  onSetAll,
  selectAllLabel = 'Select all',
}) {
  const [filterText, setFilterText] = useState('');

  let visible = options;
  if (searchable) {
    const needle = filterText.trim().toLowerCase();
    visible = options.filter(
      (option) =>
        selected.includes(option) ||
        ((counts.get(option) ?? 0) > 0 && option.toLowerCase().includes(needle)),
    );
    visible.sort((a, b) => selected.includes(b) - selected.includes(a));
  }

  return (
    <details open className="group border-b border-line py-2">
      <summary
        className="-mx-2 flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-1 text-sm
          font-semibold text-fg hover:bg-hover"
      >
        {title}
        {selected.length > 0 && (
          <span className="mr-2 ml-auto text-xs font-normal text-accent">{selected.length} selected</span>
        )}
        <ChevronRightIcon className="size-5 text-muted transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>

      {searchable && (
        <input
          type="search"
          value={filterText}
          onChange={(event) => setFilterText(event.target.value)}
          placeholder={`Find ${title.toLowerCase()}…`}
          aria-label={`Find ${title.toLowerCase()}`}
          className="mt-2 w-full rounded border border-line-strong px-2 py-1 text-sm"
        />
      )}

      <ul className={`mt-2 space-y-0.5 ${searchable ? 'max-h-72 overflow-y-auto' : ''}`}>
        {onSetAll && (
          <li className="border-b border-line-faint pb-1">
            <SelectAll label={selectAllLabel} options={options} selected={selected} onSetAll={onSetAll} />
          </li>
        )}
        {visible.map((option) => {
          const count = counts.get(option) ?? 0;
          const checked = selected.includes(option);
          const disabled = count === 0 && !checked;
          return (
            <li key={option}>
              <label
                // items-start + mt-0.5: the box and the count line up with the label's
                // first line (20px tall) even when a long label wraps.
                className={`flex items-start gap-2 rounded px-1 py-1 text-sm ${
                  disabled ? 'cursor-default opacity-40' : 'cursor-pointer hover:bg-hover'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(option)}
                  className="mt-0.5 size-4 shrink-0 accent-emerald-700"
                />
                <span className="flex-1 text-body">{renderLabel ? renderLabel(option) : option}</span>
                <span className="mt-0.5 text-xs text-muted tabular-nums">{count}</span>
              </label>
            </li>
          );
        })}
        {visible.length === 0 && <li className="px-1 py-1 text-sm text-muted">No matches</li>}
      </ul>
    </details>
  );
}

/**
 * "Select all" checkbox. Shows a dash (indeterminate) when only some options
 * are checked. Clicking it checks everything, or clears everything if all
 * were already checked.
 */
function SelectAll({ label, options, selected, onSetAll }) {
  const ref = useRef(null);
  const allChecked = options.length > 0 && options.every((option) => selected.includes(option));
  const someChecked = selected.length > 0 && !allChecked;

  // "indeterminate" can only be set from code, not as an HTML attribute.
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = someChecked;
  }, [someChecked]);

  return (
    <label className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm font-medium text-body hover:bg-hover">
      <input
        ref={ref}
        type="checkbox"
        checked={allChecked}
        onChange={() => onSetAll(allChecked ? [] : [...options])}
        className="mt-0.5 size-4 shrink-0 accent-emerald-700"
      />
      {label}
    </label>
  );
}
