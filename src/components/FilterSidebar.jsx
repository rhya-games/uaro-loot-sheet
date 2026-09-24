import { memo, useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip.jsx';
import CheckboxGroup from './CheckboxGroup.jsx';
import { ActionBadge, CategoryBadge } from './ItemBadges.jsx';
import { ALL_CATEGORIES, ALL_ITEM_TYPES, FILTER_ACTIONS } from '../utils/labels.js';
import { countOptions, listOptions, toggleValue } from '../utils/filter.js';
import { ACTIVITIES } from '../utils/activities.js';

/**
 * Advanced filters shown beside the item table.
 *
 * Props:
 *   allItems   - every item (used to list the "Used For" options)
 *   items      - items matching the search box (before sidebar filters),
 *                used to calculate the counts next to each option
 *   filters    - current filter state (see EMPTY_FILTERS in utils/filter.js)
 *   onChange   - called with the new filter state
 *   keepFor - activity ids the player keeps items for (see utils/activities.js)
 *   keepForDisabled - true in admin mode, where every activity counts
 *   onKeepForChange - called with the new list of activity ids
 *   onClose    - optional: shows a close (×) button that calls this
 *   resultCount, totalCount - items shown, and all items ("709 of 1,094 items")
 *   anyActive  - true when any filter is on (shows Clear all)
 *   onClearAll - called when "Clear all" is clicked
 *   closeButtonRef - optional ref for that button (so it can be focused)
 */
/*
 * Wrapped in `memo` so it only redraws when its own props change (not when
 * the panel opens or closes). The parent passes stable functions (useCallback).
 */
export default memo(function FilterSidebar({
  allItems,
  items,
  filters,
  onChange,
  keepFor,
  keepForDisabled,
  onKeepForChange,
  onClose,
  resultCount,
  totalCount,
  anyActive,
  onClearAll,
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


  return (
    <div>
      {/* Stays pinned to the top of the panel while the filters scroll underneath:
          the title (as tall as the search box beside it, h-11, so their edges line up),
          then how many items the filters leave, with Clear all. */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-line bg-surface px-4">
        <div className="flex h-11 items-center gap-3">
          <h2 className="text-base font-semibold text-fg">Filters</h2>
          {onClose && (
            <span className="ml-auto">
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
        <div className="flex min-h-7 items-center justify-between gap-2 pb-2">
          <p className="text-sm text-muted" aria-live="polite">
            {resultCount.toLocaleString('en-US')} of {totalCount.toLocaleString('en-US')} items
          </p>
          {anyActive && (
            <button
              type="button"
              onClick={onClearAll}
              className="rounded px-1.5 py-0.5 text-sm font-medium text-muted hover:bg-hover hover:text-fg"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* A setting about the player rather than a filter: which activities
          Keep applies to. Items only kept for unticked ones show how to sell them. */}
      <fieldset
        disabled={keepForDisabled}
        aria-describedby="keep-for-hint"
        className={`my-2 rounded-lg bg-subtle p-2 text-sm ${keepForDisabled ? 'opacity-60' : ''}`}
      >
        <legend className="float-left font-medium text-fg">I keep items for</legend>
        <p id="keep-for-hint" className="clear-left text-muted">
          {keepForDisabled
            ? 'Off in admin mode, so you see every action.'
            : 'Untick what you don’t do, and those items show how to sell them instead.'}
        </p>
        <div className="mt-1 flex flex-col">
          {ACTIVITIES.map((activity) => (
            <label
              key={activity.id}
              className={`-mx-1 flex items-center gap-2 rounded px-1 py-0.5 ${keepForDisabled ? '' : 'cursor-pointer hover:bg-hover'}`}
            >
              <input
                type="checkbox"
                checked={keepFor.includes(activity.id)}
                onChange={() => onKeepForChange(toggleValue(keepFor, activity.id))}
                className="size-4 shrink-0 accent-emerald-700"
              />
              <span className="text-body">{activity.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <CheckboxGroup
        title="Action"
        {...groupProps('actions', FILTER_ACTIONS)}
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
});
