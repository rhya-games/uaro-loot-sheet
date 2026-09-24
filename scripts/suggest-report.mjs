/**
 * Compares the suggested actions (src/utils/suggest.js) with the actions
 * set by hand in loot.json, to check the formula before trusting it.
 *
 * Usage:
 *   npm run suggest               summary, plus every item where they differ
 *   npm run suggest -- "Love"     full reasoning for items whose name matches
 */
import { readFileSync } from 'node:fs';
import { createSuggester } from '../src/utils/suggest.js';

const items = JSON.parse(readFileSync('src/data/loot.json', 'utf8'));
const suggest = createSuggester(items);
const search = process.argv[2]?.toLowerCase();
const same = (a, b) => a.length === b.length && a.every((action) => b.includes(action));

if (search) {
  for (const item of items.filter((item) => item.name.toLowerCase().includes(search))) {
    const { actions, reasons } = suggest(item);
    console.log(`\n${item.name}\n  set by hand: ${item.actions.join(' + ') || '—'}\n  suggested:   ${actions.join(' + ') || '—'}`);
    for (const reason of reasons) console.log(`    - ${reason}`);
  }
  process.exit(0);
}

const groups = { agree: [], differ: [], newSuggestion: [], unsure: [] };
for (const item of items) {
  const { actions } = suggest(item);
  if (!actions.length) groups.unsure.push(item);
  else if (!item.actions.length) groups.newSuggestion.push([item, actions]);
  else if (same(item.actions, actions)) groups.agree.push(item);
  else groups.differ.push([item, actions]);
}

// Count differences by pattern ("Keep + Vend -> Keep + NPC") to see trends.
const patterns = new Map();
for (const [item, actions] of groups.differ) {
  const key = `${item.actions.join(' + ')}  ->  ${actions.join(' + ')}`;
  patterns.set(key, [...(patterns.get(key) ?? []), item.name]);
}

console.log(`${items.length} items`);
console.log(`  ${groups.agree.length} suggestion matches the hand-set action`);
console.log(`  ${groups.differ.length} differ`);
console.log(`  ${groups.newSuggestion.length} had no action; now have a suggestion`);
console.log(`  ${groups.unsure.length} still unsure (no price to go on)`);
console.log('\nDifferences (hand-set -> suggested):');
for (const [pattern, names] of [...patterns].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(names.length).padStart(4)}  ${pattern}   e.g. ${names.slice(0, 4).join(', ')}`);
}
const newCounts = new Map();
for (const [, actions] of groups.newSuggestion) newCounts.set(actions.join(' + '), (newCounts.get(actions.join(' + ')) ?? 0) + 1);
console.log('\nNew suggestions for items with no action:');
for (const [pattern, count] of newCounts) console.log(`  ${String(count).padStart(4)}  ${pattern}`);
