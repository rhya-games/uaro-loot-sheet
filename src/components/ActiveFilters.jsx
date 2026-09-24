import Badge from './Badge.jsx';
import { ACTIONS, ALL_ACTIONS, ALL_CATEGORIES, ALL_ITEM_TYPES, FALLBACK_ACTION, categoryChip } from '../utils/labels.js';
import { FILTER_GROUPS } from '../utils/filter.js';
import { ACTIVITIES, keepsEverything } from '../utils/activities.js';

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
 * Removable chips for what's narrowing the list: what the player keeps
 * items for (when not everything) and every checked filter, then Clear all.
 * The search text isn't a chip: the search box shows it and has its own ×.
 * Nothing shows when no filter is on.
 *
 * Props:
 *   filters           - current filter state
 *   keepFor           - activity ids the player keeps items for (utils/activities.js)
 *   onClearKeepFor    - called when the "Keeping for" chip's × is clicked (back to everything)
 *   onRemove          - called with (groupKey, value) to uncheck one option
 *   onRemoveGroup     - called with groupKey to uncheck a whole group
 *   onClearAll        - called when "Clear all" is clicked
 */
export default function ActiveFilters({
  filters,
  keepFor,
  onClearKeepFor,
  onRemove,
  onRemoveGroup,
  onClearAll,
}) {
  const chips = [];
  if (!keepsEverything(keepFor)) {
    // Name whichever list is shorter: "Keeping for: Pets" or "Not keeping for: Cooking".
    const kept = ACTIVITIES.filter((activity) => keepFor.includes(activity.id)).map((activity) => activity.label);
    const skipped = ACTIVITIES.filter((activity) => !keepFor.includes(activity.id)).map((activity) => activity.label);
    const text =
      kept.length === 0
        ? 'Not keeping items'
        : kept.length <= skipped.length
          ? `Keeping for: ${kept.join(', ')}`
          : `Not keeping for: ${skipped.join(', ')}`;
    chips.push({ key: 'keepFor', text, colors: { className: NEUTRAL }, onRemove: onClearKeepFor });
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
    // Fills the rest of the row, so "Clear all" can sit at the far right.
    // Phones: its own line under the item count, so the chips aren't squeezed.
    <ul className="flex w-full flex-wrap items-center gap-2 md:w-auto md:flex-1" aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Badge {...chip.colors} onRemove={chip.onRemove} removeLabel={`Remove ${chip.text}`}>
            {chip.text}
          </Badge>
        </li>
      ))}
      <li className="ml-auto">
        {/* Small, so the row stays one chip tall. */}
        <button
          type="button"
          onClick={onClearAll}
          className="rounded px-1.5 py-0.5 text-sm font-medium text-muted hover:bg-hover hover:text-fg"
        >
          Clear all
        </button>
      </li>
    </ul>
  );
}
