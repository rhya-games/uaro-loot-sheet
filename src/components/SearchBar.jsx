/**
 * Text box for searching items by name, uses, notes, category, or item ID.
 *
 * Props:
 *   value    - current search text
 *   onChange - called with the new text as the user types
 */
export default function SearchBar({ value, onChange }) {
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
        placeholder="Search by name, use, or item ID…"
        autoComplete="off"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base shadow-sm
          placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 focus:outline-none"
      />
    </div>
  );
}
