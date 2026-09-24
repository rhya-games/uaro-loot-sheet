import Badge from './Badge.jsx';
import { ACTIONS, ALL_ACTIONS, ALL_CATEGORIES, ALL_ITEM_TYPES, FALLBACK_ACTION, categoryChip } from '../utils/labels.js';
import { FILTER_GROUPS } from '../utils/filter.js';

/** Neutral chip color, for filters that don't have their own color. */
const NEUTRAL = 'bg-chip text-fg';

/** More checked options than this in one group collapse into a single chip. */
const MAX_CHIPS_PER_GROUP = 3;

/** Every option a group can have, when the list is fixed (used for "all except ..."). */
const GROUP_OPTIONS = {
  actions: ALL_ACTIONS,
  itemTypes: ALL_ITEM_TYPES,
  categories: ALL_CATEGORIES,
};

/** Chip colors for one filter: match the action/category colors where there are some. */
function chipColors(groupKey, value) {
  if (groupKey === 'actions') return { className: (ACTIONS[value] ?? FALLBACK_ACTION).className };
  if (groupKey === 'categories') return categoryChip(value);
  return { className: NEUTRAL };
}

/** Short text for a group with many checked options, e.g. "all except Card, Pet". */
function summarize(groupKey, selected) {
  const options = GROUP_OPTIONS[groupKey];
  if (!options) return `${selected.length} selected`;
  const excluded = options.filter((option) => !selected.includes(option));
  if (excluded.length === 0) return 'all';
  if (excluded.length <= MAX_CHIPS_PER_GROUP) return `all except ${excluded.join(', ')}`;
  return `${selected.length} of ${options.length}`;
}

/**
 * A row of removable chips showing what's currently narrowing the list:
 * the search text, "I don't keep items", and every checked sidebar filter.
 * Hidden when nothing is active.
 *
 * Props:
 *   query             - current search text
 *   filters           - current filter state
 *   ignoreKeep        - true when "I don't keep items" is on
 *   onClearQuery      - called when the search chip's × is clicked
 *   onClearIgnoreKeep - called when the "I don't keep items" chip's × is clicked
 *   onRemove          - called with (groupKey, value) to uncheck one option
 *   onRemoveGroup     - called with groupKey to uncheck a whole group
 *   onClearAll        - called when "Clear all" is clicked
 */
export default function ActiveFilters({
  query,
  filters,
  ignoreKeep,
  onClearQuery,
  onClearIgnoreKeep,
  onRemove,
  onRemoveGroup,
  onClearAll,
}) {
  const chips = [];
  if (query) {
    chips.push({ key: 'search', text: `Search: “${query}”`, colors: { className: NEUTRAL }, onRemove: onClearQuery });
  }
  if (ignoreKeep) {
    chips.push({ key: 'ignoreKeep', text: "I don't keep items", colors: { className: NEUTRAL }, onRemove: onClearIgnoreKeep });
  }
  for (const group of FILTER_GROUPS) {
    const selected = filters[group.key];
    if (selected.length > MAX_CHIPS_PER_GROUP) {
      chips.push({
        key: group.key,
        text: `${group.title}: ${summarize(group.key, selected)}`,
        colors: { className: NEUTRAL },
        onRemove: () => onRemoveGroup(group.key),
      });
      continue;
    }
    for (const value of selected) {
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
          <button type="button" onClick={onClearAll} className="text-sm text-accent hover:underline">
            Clear all
          </button>
        </li>
      )}
    </ul>
  );
}
