import { FILTER_GROUPS } from '../utils/filter.js';

/**
 * A row of removable chips showing what's currently narrowing the list:
 * the search text and every checked sidebar filter. Hidden when nothing is active.
 *
 * Props:
 *   query         - current search text
 *   filters       - current filter state
 *   onClearQuery  - called when the search chip's × is clicked
 *   onRemove      - called with (groupKey, value) when a filter chip's × is clicked
 *   onClearAll    - called when "Clear all" is clicked
 */
export default function ActiveFilters({ query, filters, onClearQuery, onRemove, onClearAll }) {
  const chips = [];
  if (query) chips.push({ key: 'search', label: 'Search', value: `“${query}”`, onRemove: onClearQuery });
  for (const group of FILTER_GROUPS) {
    for (const value of filters[group.key]) {
      chips.push({ key: `${group.key}:${value}`, label: group.title, value, onRemove: () => onRemove(group.key, value) });
    }
  }
  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <li
          key={chip.key}
          className="flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-50 py-0.5 pr-1 pl-3 text-sm text-emerald-900"
        >
          <span className="text-emerald-700">{chip.label}:</span> {chip.value}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label} ${chip.value}`}
            className="flex size-6 items-center justify-center rounded-full leading-none hover:bg-emerald-100"
          >
            ×
          </button>
        </li>
      ))}
      {chips.length > 1 && (
        <li>
          <button type="button" onClick={onClearAll} className="text-sm text-emerald-700 hover:underline">
            Clear all
          </button>
        </li>
      )}
    </ul>
  );
}
