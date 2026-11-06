import { createContext } from 'react';

/**
 * The "Used For" targets that more than one item uses. Only these get a
 * filter link: filtering by a target with a single item would show that item
 * alone, which tells you nothing.
 *
 * Returns a Set of target names.
 */
export function sharedUseTargets(items) {
  const counts = new Map();
  for (const item of items) {
    // A target listed twice on one item still counts as one item.
    for (const target of new Set(item.uses.map((use) => use.for))) {
      counts.set(target, (counts.get(target) ?? 0) + 1);
    }
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([target]) => target));
}

/**
 * Lets ItemUses know which targets can be filtered by, without passing the
 * set down through the list, table and cards. Without a provider every
 * target gets a link, as before.
 */
export const SharedUsesContext = createContext(null);
