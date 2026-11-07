/**
 * Fills in `vend` (how players' prices compare with the NPC price) in
 * src/data/loot.json from the private prices, for items where it's still
 * "unknown". It never changes a `vend` that's already set: that is set by hand,
 * and prices are only extra information. Items where the price points the
 * other way are listed, so you can look at them.
 * The prices themselves aren't in the repo (see scripts/private-data.mjs).
 *
 * Usage:
 *   npm run sync:vend             (update loot.json)
 *   npm run sync:vend -- --check  (only report, change nothing)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { vendFlag } from '../src/utils/prices.js';
import { PRICES_FILE, hasPrivatePrices, readPrices, withPrices } from './private-data.mjs';

const LOOT_FILE = 'src/data/loot.json';
const checkOnly = process.argv.includes('--check');

if (!hasPrivatePrices()) {
  console.error(`No private prices at ${PRICES_FILE}, so there's nothing to work out the vend values from.`);
  process.exit(1);
}

const items = JSON.parse(readFileSync(LOOT_FILE, 'utf8'));
const priced = withPrices(items, readPrices());
const changes = [];
const differs = [];
priced.forEach((item, index) => {
  const flag = vendFlag(item);
  const stored = items[index].vend ?? 'unknown';
  if (stored === 'unknown' && flag !== 'unknown') {
    changes.push(`${item.name}: unknown -> ${flag}`);
    items[index].vend = flag;
  } else if (stored !== flag && flag !== 'unknown') {
    differs.push(`${item.name}: set to ${stored}, its price says ${flag}`);
  }
});

console.log(`${changes.length} items ${checkOnly ? 'would change' : 'changed'}.`);
for (const line of changes) console.log(`  ${line}`);
if (differs.length) {
  console.log(`\n${differs.length} items where the price says something else (left as set):`);
  for (const line of differs) console.log(`  ${line}`);
}
if (!checkOnly && changes.length) {
  writeFileSync(LOOT_FILE, JSON.stringify(items, null, 2) + '\n');
  console.log(`\nWrote ${LOOT_FILE}. Next: npm run validate`);
}
if (checkOnly && changes.length) process.exitCode = 1;
