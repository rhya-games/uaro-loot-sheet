import { useMemo } from 'react';
import Badge from './Badge.jsx';
import CheckboxGroup from './CheckboxGroup.jsx';
import { ACTIONS, ALL_ACTIONS, ALL_CATEGORIES, ALL_ITEM_TYPES, FALLBACK_ACTION } from '../utils/labels.js';
import { countActiveFilters, countOptions, listOptions, toggleValue } from '../utils/filter.js';

/**
 * Advanced filters shown beside the item table.
 *
 * Props:
 *   allItems  - every item (used to list the "Used For" options)
 *   items     - items matching the search box (before sidebar filters),
 *               used to calculate the counts next to each option
 *   filters   - current filter state (see EMPTY_FILTERS in utils/filter.js)
 *   onChange  - called with the new filter state
 *   onClear   - called when "Clear all" is clicked
 */
export default function FilterSidebar({ allItems, items, filters, onChange, onClear }) {
  const usedForOptions = useMemo(() => listOptions(allItems, 'usedFor'), [allItems]);

  /** Shared props for one group's CheckboxGroup. */
  const groupProps = (key, options) => ({
    options,
    counts: countOptions(items, filters, key),
    selected: filters[key],
    onToggle: (value) => onChange({ ...filters, [key]: toggleValue(filters[key], value) }),
  });

  return (
    <div>
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-sm font-bold tracking-wide text-gray-500 uppercase">Filters</h2>
        {countActiveFilters(filters) > 0 && (
          <button type="button" onClick={onClear} className="text-sm text-emerald-700 hover:underline">
            Clear all
          </button>
        )}
      </div>

      <CheckboxGroup
        title="Action"
        {...groupProps('actions', ALL_ACTIONS)}
        renderLabel={(action) => {
          const style = ACTIONS[action] ?? FALLBACK_ACTION;
          return (
            <Badge className={style.className} title={style.description}>
              {action}
            </Badge>
          );
        }}
      />

      <CheckboxGroup title="Item Type" {...groupProps('itemTypes', ALL_ITEM_TYPES)} />

      <CheckboxGroup title="Category" {...groupProps('categories', ALL_CATEGORIES)} />

      <CheckboxGroup title="Used For" searchable {...groupProps('usedFor', usedForOptions)} />
    </div>
  );
}
