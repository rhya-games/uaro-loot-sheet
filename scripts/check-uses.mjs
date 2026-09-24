/**
 * Compares recipes (for example, a quest table copied from the uaRO wiki)
 * with the "Used For" data in src/data/loot.json, and lists every difference.
 * It only reports; it never changes loot.json.
 *
 * Usage:
 *   npm run check:uses -- path/to/recipes.json
 *   npm run check:uses -- path/to/recipes.json --suffix " Pet Evolution"
 *
 * recipes.json is a list of recipes. Materials are [name, quantity]:
 *   [
 *     { "target": "Mitra [1]", "materials": [["Poring Coin", 1500], ["Handcuffs", 1000]] },
 *     ...
 *   ]
 *
 * --suffix is added to each target when looking it up, for sheets names like
 * "Mastering Pet Evolution" (the wiki just says "Mastering").
 *
 * Names are matched loosely: case, punctuation, slot counts ("[1]") and
 * anything in parentheses are ignored. Items or targets the wiki names
 * differently go in scripts/source/name-aliases.mjs.
 */
import { readFileSync } from 'node:fs';
import { NAME_ALIASES, TARGET_ALIASES } from './source/name-aliases.mjs';

const [recipesFile, ...args] = process.argv.slice(2);
if (!recipesFile) {
  console.error('Usage: npm run check:uses -- path/to/recipes.json [--suffix " Pet Evolution"]');
  process.exit(1);
}
const suffixIndex = args.indexOf('--suffix');
const suffix = suffixIndex === -1 ? '' : args[suffixIndex + 1];

const recipes = JSON.parse(readFileSync(recipesFile, 'utf8'));
const items = JSON.parse(readFileSync('src/data/loot.json', 'utf8'));

/** "Hyegun Hat [1] (Yao Jun)" -> "hyegunhat" */
const simplify = (name) =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[\d\]/g, '')
    .replace(/[^a-z0-9]/g, '');

// Exact names win, so "Majestic Goat [0]" and "Majestic Goat [1]" stay apart.
const itemByName = new Map(items.map((item) => [item.name.toLowerCase(), item]));
const itemBySimpleName = new Map(items.map((item) => [simplify(item.name), item]));
function findItem(name) {
  const sheetName = NAME_ALIASES[name] ?? name;
  return itemByName.get(sheetName.toLowerCase()) ?? itemBySimpleName.get(simplify(sheetName));
}

// Every "Used For" target in the sheet, and which items it uses.
const usesByTarget = new Map();
for (const item of items) {
  for (const use of item.uses) {
    if (!usesByTarget.has(use.for)) usesByTarget.set(use.for, []);
    usesByTarget.get(use.for).push({ item: item.name, qty: use.qty });
  }
}
const targetBySimpleName = new Map([...usesByTarget.keys()].map((target) => [simplify(target), target]));

/** The sheet's name for a recipe target, trying "A (B)" and "A / B" alternatives too. */
function findTarget(name) {
  if (TARGET_ALIASES[name]) return TARGET_ALIASES[name];
  const alternatives = [name, ...(name.match(/\((.*?)\)/g) ?? []).map((part) => part.slice(1, -1)), ...name.split('/')];
  for (const alternative of alternatives) {
    const found = targetBySimpleName.get(simplify(alternative.trim() + suffix));
    if (found) return found;
  }
  return null;
}

let problems = 0;
const notInSheet = new Set();
for (const recipe of recipes) {
  const target = findTarget(recipe.target);
  const sheetUses = target ? usesByTarget.get(target) : [];
  const lines = [];
  const matched = new Set();

  for (const [name, qty] of recipe.materials) {
    const item = findItem(name);
    if (!item) {
      notInSheet.add(name);
      lines.push(`not in the sheet: ${name} x${qty}`);
      continue;
    }
    matched.add(item.name);
    const use = sheetUses.find((entry) => entry.item === item.name);
    if (!use) lines.push(`missing: ${item.name} x${qty}`);
    else if (use.qty !== qty) lines.push(`quantity: ${item.name} is x${use.qty} in the sheet, x${qty} in the recipe`);
  }
  for (const use of sheetUses) {
    if (!matched.has(use.item)) lines.push(`extra in the sheet: ${use.item} x${use.qty}`);
  }

  if (lines.length) {
    problems += lines.length;
    console.log(`\n${recipe.target}  ->  ${target ? `sheet target "${target}"` : 'NO MATCHING TARGET in the sheet'}`);
    lines.forEach((line) => console.log(`  - ${line}`));
  }
}

console.log(`\nChecked ${recipes.length} recipes: ${problems} differences.`);
if (notInSheet.size) {
  console.log(`Not in the sheet (add them, or add an alias): ${[...notInSheet].join(', ')}`);
}
