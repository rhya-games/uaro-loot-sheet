import { useState } from 'react';

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
 */
export default function CheckboxGroup({ title, options, counts, selected, onToggle, renderLabel, searchable = false }) {
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
    <details open className="group border-b border-gray-200 py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
        {title}
        {selected.length > 0 && (
          <span className="mr-2 ml-auto text-xs font-normal text-emerald-700">{selected.length} selected</span>
        )}
        <span className="text-gray-400 transition-transform group-open:rotate-90" aria-hidden="true">
          ›
        </span>
      </summary>

      {searchable && (
        <input
          type="search"
          value={filterText}
          onChange={(event) => setFilterText(event.target.value)}
          placeholder={`Find ${title.toLowerCase()}…`}
          aria-label={`Find ${title.toLowerCase()}`}
          className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
      )}

      <ul className={`mt-2 space-y-0.5 ${searchable ? 'max-h-72 overflow-y-auto' : ''}`}>
        {visible.map((option) => {
          const count = counts.get(option) ?? 0;
          const checked = selected.includes(option);
          const disabled = count === 0 && !checked;
          return (
            <li key={option}>
              <label
                className={`flex items-center gap-2 rounded px-1 py-1 text-sm ${
                  disabled ? 'cursor-default opacity-40' : 'cursor-pointer hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(option)}
                  className="size-4 shrink-0 accent-emerald-700"
                />
                <span className="flex-1 text-gray-800">{renderLabel ? renderLabel(option) : option}</span>
                <span className="text-xs text-gray-400 tabular-nums">{count}</span>
              </label>
            </li>
          );
        })}
        {visible.length === 0 && <li className="px-1 py-1 text-sm text-gray-400">No matches</li>}
      </ul>
    </details>
  );
}
