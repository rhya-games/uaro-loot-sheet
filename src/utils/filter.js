/**
 * Sidebar filter logic. Kept separate from the UI so it's easy to test
 * and to add new filters.
 *
 * Rules:
 *   - Inside one group, an item matches if it has ANY checked option
 *     (checking "Vend" and "Whobuy" shows items with either).
 *   - Across groups, an item must match ALL groups.
 *   - An empty group means "don't filter by this".
 */

/**
 * Every filter group, in sidebar order.
 *   key       - name of this group in the filter state
 *   title     - heading shown in the sidebar
 *   getValues - returns the item's values for this group, as a list
 *
 * To add a group: add it here (EMPTY_FILTERS updates itself), then show it
 * in components/FilterSidebar.jsx.
 */
export const FILTER_GROUPS = [
  { key: 'actions', title: 'Action', getValues: (item) => item.actions },
  { key: 'itemTypes', title: 'Item Type', getValues: (item) => [item.itemType] },
  { key: 'categories', title: 'Category', getValues: (item) => item.categories },
  { key: 'usedFor', title: 'Used For', getValues: (item) => item.uses.map((use) => use.for) },
];

/** Starting state: nothing checked, e.g. { actions: [], itemTypes: [], ... }. */
export const EMPTY_FILTERS = Object.fromEntries(FILTER_GROUPS.map((group) => [group.key, []]));

/** True if the item passes one group's filter. */
function matchesGroup(item, group, filters) {
  const selected = filters[group.key];
  if (selected.length === 0) return true;
  return group.getValues(item).some((value) => selected.includes(value));
}

/** Items that pass every filter group. */
export function filterItems(items, filters) {
  return items.filter((item) => FILTER_GROUPS.every((group) => matchesGroup(item, group, filters)));
}

/**
 * How many items each option in a group would show if you checked it.
 * Uses every OTHER group's filter (not its own), so counts stay useful
 * while you tick more boxes in the same group.
 *
 * Returns a Map: option value -> count.
 */
export function countOptions(items, filters, groupKey) {
  const group = FILTER_GROUPS.find((g) => g.key === groupKey);
  const otherGroups = FILTER_GROUPS.filter((g) => g.key !== groupKey);
  const counts = new Map();
  for (const item of items) {
    if (!otherGroups.every((g) => matchesGroup(item, g, filters))) continue;
    for (const value of new Set(group.getValues(item))) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/** Every distinct value a group has across all items, sorted A-Z. */
export function listOptions(items, groupKey) {
  const group = FILTER_GROUPS.find((g) => g.key === groupKey);
  const values = new Set(items.flatMap((item) => group.getValues(item)));
  return [...values].sort((a, b) => a.localeCompare(b));
}

/** Number of checked options across all groups. */
export function countActiveFilters(filters) {
  return FILTER_GROUPS.reduce((total, group) => total + filters[group.key].length, 0);
}

/** Adds the value to the list if missing, removes it if present. */
export function toggleValue(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

