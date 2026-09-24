import { useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip.jsx';
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
 *   onClose    - optional: shows a close (×) button that calls this
 *   closeButtonRef - optional ref for that button (so it can be focused)
 */
export default function FilterSidebar({
  allItems,
  items,
  filters,
  onChange,
  onClear,
  ignoreKeep,
  onIgnoreKeepChange,
  onClose,
  closeButtonRef,
}) {
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
      {/* Stays pinned to the top of the panel while the filters scroll underneath. */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 border-b border-line bg-surface px-4 pt-3 pb-2">
        <h2 className="text-sm font-bold tracking-wide text-muted uppercase">Filters</h2>
        {countActiveFilters(filters) > 0 && (
          <button type="button" onClick={onClear} className="ml-auto text-sm text-accent hover:underline">
            Clear all
          </button>
        )}
        {onClose && (
          <span className={countActiveFilters(filters) > 0 ? '' : 'ml-auto'}>
            <Tooltip text="Close filters" placement="bottom">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-fg"
              >
                <XMarkIcon className="size-5" aria-hidden="true" />
              </button>
            </Tooltip>
          </span>
        )}
      </div>

      <label className="my-2 flex cursor-pointer items-start gap-2 rounded-lg bg-subtle p-2 text-sm hover:bg-hover">
        <input
          type="checkbox"
          checked={ignoreKeep}
          onChange={(event) => onIgnoreKeepChange(event.target.checked)}
          aria-describedby="ignore-keep-hint"
          className="mt-0.5 size-4 shrink-0 accent-emerald-700"
        />
        <span>
          <span className="font-medium text-fg">I don't keep items</span>
          <span id="ignore-keep-hint" className="block text-muted">
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
