import Badge from './Badge.jsx';
import { ACTIONS, FALLBACK_ACTION, categoryStyle } from '../utils/labels.js';
import { FILTER_GROUPS } from '../utils/filter.js';

/** Neutral chip color, for filters that don't have their own color. */
const NEUTRAL = 'bg-gray-200 text-gray-800';

/** Chip colors for one filter: match the action/category colors where there are some. */
function chipColors(groupKey, value) {
  if (groupKey === 'actions') return { className: (ACTIONS[value] ?? FALLBACK_ACTION).className };
  if (groupKey === 'categories') return { style: categoryStyle(value) };
  return { className: NEUTRAL };
}

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
  if (query) {
    chips.push({ key: 'search', text: `Search: “${query}”`, colors: { className: NEUTRAL }, onRemove: onClearQuery });
  }
  for (const group of FILTER_GROUPS) {
    for (const value of filters[group.key]) {
      chips.push({
        key: `${group.key}:${value}`,
        text: `${group.title}: ${value}`,
        colors: chipColors(group.key, value),
        onRemove: () => onRemove(group.key, value),
      });
    }
  }
  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Badge {...chip.colors} onRemove={chip.onRemove} removeLabel={`Remove ${chip.text}`}>
            {chip.text}
          </Badge>
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
