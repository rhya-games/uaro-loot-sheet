import { useMemo } from 'react';
import CheckboxGroup from './CheckboxGroup.jsx';
import { ActionBadge, CategoryBadge } from './ItemBadges.jsx';
import { ALL_ACTIONS, ALL_CATEGORIES, ALL_ITEM_TYPES } from '../utils/labels.js';
import { countActiveFilters, countOptions, listOptions, toggleValue } from '../utils/filter.js';

/**
 * Advanced filters shown beside the item table.
 *
 * Props:
 *   allItems   - every item (used to list the "Used For" options)
 *   items      - items matching the search box (before sidebar filters),
 *                used to calculate the counts next to each option
 *   filters    - current filter state (see EMPTY_FILTERS in utils/filter.js)
 *   onChange   - called with the new filter state
 *   onClear    - called when "Clear all" is clicked
 *   ignoreKeep - true when "I don't keep items" is on
 *   onIgnoreKeepChange - called with true/false when that switch changes
 */
export default function FilterSidebar({ allItems, items, filters, onChange, onClear, ignoreKeep, onIgnoreKeepChange }) {
  const usedForOptions = useMemo(() => listOptions(allItems, 'usedFor'), [allItems]);

  /** Shared props for one group's CheckboxGroup. */
  const groupProps = (key, options) => ({
    options,
    counts: countOptions(items, filters, key),
    selected: filters[key],
    onToggle: (value) => onChange({ ...filters, [key]: toggleValue(filters[key], value) }),
  });

  const actionOptions = ignoreKeep ? ALL_ACTIONS.filter((action) => action !== 'Keep') : ALL_ACTIONS;

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

      <label className="my-2 flex cursor-pointer items-start gap-2 rounded-lg bg-gray-50 p-2 text-sm hover:bg-gray-100">
        <input
          type="checkbox"
          checked={ignoreKeep}
          onChange={(event) => onIgnoreKeepChange(event.target.checked)}
          aria-describedby="ignore-keep-hint"
          className="mt-0.5 size-4 shrink-0 accent-emerald-700"
        />
        <span>
          <span className="font-medium text-gray-900">I don't keep items</span>
          <span id="ignore-keep-hint" className="block text-gray-600">
            Skip quests, hats and pets: hides Keep so you only see what to sell.
          </span>
        </span>
      </label>

      <CheckboxGroup
        title="Action"
        {...groupProps('actions', actionOptions)}
        renderLabel={(action) => <ActionBadge action={action} />}
      />

      <CheckboxGroup title="Item Type" {...groupProps('itemTypes', ALL_ITEM_TYPES)} />

      <CheckboxGroup
        title="Category"
        {...groupProps('categories', ALL_CATEGORIES)}
        renderLabel={(category) => <CategoryBadge category={category} />}
        onSetAll={(values) => onChange({ ...filters, categories: values })}
        selectAllLabel="Select all categories"
      />

      <CheckboxGroup title="Used For" searchable {...groupProps('usedFor', usedForOptions)} />
    </div>
  );
}
