import { isNotUsedUp, isQuest, isSkill } from './suggest.js';

const withoutSlots = (name) => name.replace(/\s*\[\d\]$/, '');

/**
 * The "Used For" targets that need a value in use-targets.json: finished
 * things that aren't loot in the sheet, so they have no price of their own.
 * Quests, skills and not-used-up uses are left out (see suggest.js), and so
 * are targets in the sheet (their own prices count).
 *
 * Returns a Map: target name -> { name, parts (item names) }.
 */
export function valueTargets(items) {
  const inSheet = new Set(items.map((item) => withoutSlots(item.name)));
  const targets = new Map();
  for (const item of items) {
    for (const use of item.uses) {
      if (isQuest(use) || isSkill(use) || isNotUsedUp(use) || inSheet.has(withoutSlots(use.for))) continue;
      if (!targets.has(use.for)) targets.set(use.for, { name: use.for, parts: [] });
      targets.get(use.for).parts.push(item.name);
    }
  }
  return targets;
}
