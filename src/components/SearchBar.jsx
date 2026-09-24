import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip.jsx';

/**
 * Text box for searching items by name, uses, notes, category, or item ID.
 * Turns green while it has text, so it's obvious a search is active.
 * Clear it with the × button or the Escape key.
 *
 * Props:
 *   value    - current search text
 *   onChange - called with the new text (or '' when cleared)
 */
export default function SearchBar({ value, onChange }) {
  const active = value !== '';

  return (
    <div className="relative">
      <label htmlFor="search" className="sr-only">
        Search items
      </label>
      {/* Decorative only; the label above names the field. */}
      <MagnifyingGlassIcon
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 ${
          active ? 'text-accent' : 'text-muted'
        }`}
      />
      <input
        id="search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          // Escape clears the search. Marked as handled so it doesn't also close the filter panel.
          if (event.key === 'Escape' && value) {
            event.preventDefault();
            onChange('');
          }
        }}
        placeholder="Search by name, use, or item ID…"
        autoComplete="off"
        className={`w-full rounded-lg border py-2.5 pr-11 pl-10 text-base shadow-sm placeholder:text-muted ${
          active ? 'border-accent-line bg-accent-soft' : 'border-line-strong bg-surface'
        }`}
      />
      {active && (
        <span className="absolute top-1/2 right-2 -translate-y-1/2">
          <Tooltip text="Clear search (Esc)">
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Clear search"
              className="flex size-8 items-center justify-center rounded-full text-accent hover:bg-accent-soft"
            >
              <XMarkIcon className="size-5" aria-hidden="true" />
            </button>
          </Tooltip>
        </span>
      )}
    </div>
  );
}
