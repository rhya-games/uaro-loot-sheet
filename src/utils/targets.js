import { isNotUsedUp, isQuest } from './suggest.js';

const withoutSlots = (name) => name.replace(/\s*\[\d\]$/, '');

/**
 * The "Used For" targets that need a value in use-targets.json: finished
 * things that aren't loot in the sheet, so they have no price of their own.
 * Quests and not-used-up uses are left out (see suggest.js), and so are
 * targets in the sheet (their own prices count).
 *
 * Returns a Map: target name -> { name, parts (item names), skill }.
 * `skill` is true for skills ("each cast"), which have no item ID.
 */
export function valueTargets(items) {
  const inSheet = new Set(items.map((item) => withoutSlots(item.name)));
  const targets = new Map();
  for (const item of items) {
    for (const use of item.uses) {
      if (isQuest(use) || isNotUsedUp(use) || inSheet.has(withoutSlots(use.for))) continue;
      if (!targets.has(use.for)) targets.set(use.for, { name: use.for, parts: [], skill: false });
      const target = targets.get(use.for);
      target.parts.push(item.name);
      if (use.note === 'each cast') target.skill = true;
    }
  }
  return targets;
}
