/**
 * Updates the item data from the Hercules emulator (pre-renewal):
 *   - src/data/game-rules.json: the Overcharge bonus used for the NPC Sell column
 *   - src/data/loot.json: each item's `sellValue` (zeny an NPC pays, before skills)
 *
 * Usage:
 *   npm run sync:hercules            (update the files)
 *   npm run sync:hercules -- --check (only report differences, change nothing)
 *
 * Items Hercules doesn't have (custom server items, or no item ID yet) keep
 * whatever value they already have, and are listed at the end.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { loadItemDb, loadOverchargePercent } from './hercules.mjs';

const LOOT_FILE = 'src/data/loot.json';
const RULES_FILE = 'src/data/game-rules.json';
const OVERCHARGE_LEVEL = 10;
const checkOnly = process.argv.includes('--check');

const items = JSON.parse(readFileSync(LOOT_FILE, 'utf8'));
const itemDb = await loadItemDb();
const overchargePercent = await loadOverchargePercent(OVERCHARGE_LEVEL);

const rules = {
  overchargeLevel: OVERCHARGE_LEVEL,
  overchargePercent,
  source: 'Hercules src/map/pc.cpp, pc_modifysellvalue()',
};

const changed = [];
const notInHercules = [];
for (const item of items) {
  const herculesItem = item.itemId != null ? itemDb.get(item.itemId) : undefined;
  if (!herculesItem) {
    notInHercules.push(item);
    continue;
  }
  if (item.sellValue !== herculesItem.sellValue) {
    changed.push(`${item.name}: ${item.sellValue ?? 'blank'} -> ${herculesItem.sellValue}`);
    item.sellValue = herculesItem.sellValue;
  }
}

console.log(`Overcharge level ${OVERCHARGE_LEVEL}: +${overchargePercent}%`);
console.log(`${changed.length} sell values ${checkOnly ? 'differ from' : 'updated from'} Hercules.`);
changed.forEach((line) => console.log(`  ${line}`));
if (notInHercules.length) {
  console.log(`\n${notInHercules.length} items aren't in Hercules (kept as-is):`);
  notInHercules.forEach((item) => console.log(`  ${item.name}: ${item.sellValue ?? 'BLANK'}`));
}

if (!checkOnly) {
  writeFileSync(LOOT_FILE, JSON.stringify(items, null, 2) + '\n');
  writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2) + '\n');
  console.log(`\nWrote ${LOOT_FILE} and ${RULES_FILE}. Next: npm run validate`);
}
