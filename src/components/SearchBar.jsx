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
      <input
        id="search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && onChange('')}
        placeholder="Search by name, use, or item ID…"
        autoComplete="off"
        className={`w-full rounded-lg border py-2.5 pr-11 pl-4 text-base shadow-sm placeholder:text-gray-400 ${
          active ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300 bg-white'
        }`}
      />
      {active && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          title="Clear search (Esc)"
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full
            text-xl leading-none text-emerald-800 hover:bg-emerald-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
