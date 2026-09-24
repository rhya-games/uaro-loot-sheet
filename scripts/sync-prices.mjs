/**
 * Updates NPC sell prices from the emulators' data:
 *   - src/data/game-rules.json: the Overcharge bonus (read from Hercules' code)
 *   - src/data/loot.json: each item's `sellValue` (zeny an NPC pays, before
 *     skills) and `sellSource` (where that number came from)
 *
 * Where prices come from, in order:
 *   1. Hercules pre-renewal ("hercules"): uaRO's base game.
 *   2. rAthena renewal ("rathena-renewal"): for renewal items that aren't in
 *      pre-renewal, or that Hercules lists without any Buy/Sell price.
 *   3. Otherwise the value already in loot.json is kept ("manual").
 * uaRO's own changes (modified prices, items NPCs won't buy, custom prices)
 * live in src/data/uaro-overrides.json and are applied by the site on top.
 *
 * It also checks items dropped in uaRO's renewal areas (listed in
 * uaro-overrides.json) and lists any whose pre-renewal and renewal prices
 * differ, for a person to review (skipping ones already listed under
 * renewalContent.reviewedPrices). It never adds drops.
 *
 * Usage:
 *   npm run sync:prices             (update the files)
 *   npm run sync:prices -- --check  (only report, change nothing)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { loadOverchargePercent, loadPreRenewalItemDb } from './hercules.mjs';
import { loadRenewalItemDb, loadRenewalMobDrops, loadSpawnedMobIds } from './rathena.mjs';

const LOOT_FILE = 'src/data/loot.json';
const RULES_FILE = 'src/data/game-rules.json';
const OVERRIDES_FILE = 'src/data/uaro-overrides.json';
const OVERCHARGE_LEVEL = 10;
const checkOnly = process.argv.includes('--check');

const items = JSON.parse(readFileSync(LOOT_FILE, 'utf8'));
const overrides = JSON.parse(readFileSync(OVERRIDES_FILE, 'utf8'));
const preRenewal = await loadPreRenewalItemDb();
const renewal = await loadRenewalItemDb();
const overchargePercent = await loadOverchargePercent(OVERCHARGE_LEVEL);

/** Returns the item with `sellValue` and `sellSource` set, keeping field order. */
function withPrice(item, sellValue, sellSource) {
  const updated = {};
  for (const [key, value] of Object.entries(item)) {
    if (key === 'sellSource') continue;
    updated[key] = value;
    if (key === 'sellValue') {
      updated.sellValue = sellValue;
      updated.sellSource = sellSource;
    }
  }
  return updated;
}

// 1. Prices.
const changed = [];
const kept = [];
const updatedItems = items.map((item) => {
  const hercules = item.itemId != null ? preRenewal.get(item.itemId) : undefined;
  const rathena = item.itemId != null ? renewal.get(item.itemId) : undefined;
  let next;
  if (hercules?.hasPrice) next = withPrice(item, hercules.sellValue, 'hercules');
  else if (rathena) next = withPrice(item, rathena.sellValue, 'rathena-renewal');
  else if (hercules) next = withPrice(item, hercules.sellValue, 'hercules');
  else {
    next = withPrice(item, item.sellValue ?? null, item.sellValue == null ? null : 'manual');
    kept.push(`${item.name}: ${item.sellValue ?? 'BLANK'}`);
  }
  if (next.sellValue !== item.sellValue) {
    changed.push(`${item.name}: ${item.sellValue ?? 'blank'} -> ${next.sellValue} (${next.sellSource})`);
  }
  return next;
});

// 2. Renewal areas: which of our items drop there, and do their prices agree?
const mobDrops = await loadRenewalMobDrops();
const itemIdByAegis = new Map();
for (const db of [renewal, preRenewal]) for (const entry of db.values()) itemIdByAegis.set(entry.aegisName, entry.id);

const areasByItemId = new Map();
for (const area of overrides.renewalContent.areas) {
  const mobIds = area.monsters ? new Set(area.monsters) : await loadSpawnedMobIds(area.spawnFile, area.maps);
  for (const mobId of mobIds) {
    for (const aegisName of mobDrops.get(mobId) ?? []) {
      const itemId = itemIdByAegis.get(aegisName);
      if (itemId == null) continue;
      if (!areasByItemId.has(itemId)) areasByItemId.set(itemId, new Set());
      areasByItemId.get(itemId).add(area.name);
    }
  }
}
const reviewedIds = new Set(overrides.renewalContent.reviewedPrices.items.map((entry) => entry.itemId));
const priceDifferences = [];
for (const item of updatedItems) {
  const areas = areasByItemId.get(item.itemId);
  if (reviewedIds.has(item.itemId)) continue;
  const renewalPrice = renewal.get(item.itemId)?.sellValue;
  if (!areas || renewalPrice == null || renewalPrice === item.sellValue) continue;
  priceDifferences.push(
    `${item.name}: ${item.sellValue} here, ${renewalPrice} in renewal (drops in ${[...areas].join(', ')})`,
  );
}

// Report.
console.log(`Overcharge level ${OVERCHARGE_LEVEL}: +${overchargePercent}%`);
console.log(`\n${changed.length} prices ${checkOnly ? 'would change' : 'changed'}.`);
changed.forEach((line) => console.log(`  ${line}`));
console.log(`\n${kept.length} items aren't in either emulator (kept as-is):`);
kept.forEach((line) => console.log(`  ${line}`));
console.log(`\n${areasByItemId.size} item types drop in uaRO's renewal areas; ${priceDifferences.length} of ours have a new, unreviewed renewal price (not changed; ${reviewedIds.size} already reviewed):`);
priceDifferences.forEach((line) => console.log(`  ${line}`));

if (!checkOnly) {
  const rules = { overchargeLevel: OVERCHARGE_LEVEL, overchargePercent, source: 'Hercules src/map/pc.cpp, pc_modifysellvalue()' };
  writeFileSync(LOOT_FILE, JSON.stringify(updatedItems, null, 2) + '\n');
  writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2) + '\n');
  console.log(`\nWrote ${LOOT_FILE} and ${RULES_FILE}. Next: npm run validate`);
}
