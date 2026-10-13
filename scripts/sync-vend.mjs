/**
 * Works out each item's stored `vend` (how its vend price compares with the
 * NPC price) from the private prices, and writes it to src/data/loot.json.
 * The prices themselves aren't in the repo (see scripts/private-data.mjs).
 *
 * Run it after anything that changes NPC prices or the private prices by
 * hand: `npm run sync:prices`, an edit to uaro-overrides.json, or editing
 * player-prices.json. Admin mode keeps it up to date when you save a price.
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
priced.forEach((item, index) => {
  const flag = vendFlag(item);
  if (items[index].vend !== flag) {
    changes.push(`${item.name}: ${items[index].vend ?? 'none set'} -> ${flag}`);
    items[index].vend = flag;
  }
});

console.log(`${changes.length} items ${checkOnly ? 'would change' : 'changed'}.`);
for (const line of changes) console.log(`  ${line}`);
if (!checkOnly && changes.length) {
  writeFileSync(LOOT_FILE, JSON.stringify(items, null, 2) + '\n');
  console.log(`\nWrote ${LOOT_FILE}. Next: npm run validate`);
}
if (checkOnly && changes.length) process.exitCode = 1;
