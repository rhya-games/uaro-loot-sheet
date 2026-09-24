/**
 * What a player keeps items for. Each activity is a group of categories:
 * an item's Keep counts for an activity when the item has one of its
 * categories. The filter panel lists these as "I keep items for".
 *
 * Categories that aren't here (Card, uaRO, Uncategorized) aren't an
 * activity by themselves. Cards are kept for pets or hats, and carry those
 * categories too.
 */
export const ACTIVITIES = [
  { id: 'hats', label: 'Hats', categories: ['Official Hat Quest', 'Server Hat Quest'] },
  { id: 'pets', label: 'Pets', categories: ['Pet', 'Pet Evolution'] },
  { id: 'cooking', label: 'Cooking', categories: ['Cooking'] },
  { id: 'crafting', label: 'Crafting and skills', categories: ['Skills', 'Brewing'] },
  { id: 'quests', label: 'Quests', categories: ['Dungeon Quest', 'Job Quest', 'Other Quest', 'Repeatable Quest'] },
];

export const ALL_ACTIVITY_IDS = ACTIVITIES.map((activity) => activity.id);

const ACTIVITY_CATEGORIES = new Set(ACTIVITIES.flatMap((activity) => activity.categories));

/** True when every activity is picked (the default: nothing changes). */
export const keepsEverything = (activityIds) => ALL_ACTIVITY_IDS.every((id) => activityIds.includes(id));

/**
 * Removes Keep from items only kept for activities the player doesn't do.
 * An item keeps its Keep when:
 *   - one of its categories belongs to a picked activity, or
 *   - none of its categories is an activity (it's kept for another reason,
 *     like Rough Oridecon for refining or Old Blue Box to open).
 * Items left with no action at all are dropped: there's nothing to do with them.
 */
export function keepOnlyFor(items, activityIds) {
  if (keepsEverything(activityIds)) return items;
  const picked = new Set(
    ACTIVITIES.filter((activity) => activityIds.includes(activity.id)).flatMap((activity) => activity.categories),
  );
  const result = [];
  for (const item of items) {
    const activityCategories = item.categories.filter((category) => ACTIVITY_CATEGORIES.has(category));
    const keepIt =
      !item.actions.includes('Keep') ||
      activityCategories.length === 0 ||
      activityCategories.some((category) => picked.has(category));
    if (keepIt) {
      result.push(item);
      continue;
    }
    const actions = item.actions.filter((action) => action !== 'Keep');
    if (actions.length) result.push({ ...item, actions });
  }
  return result;
}
