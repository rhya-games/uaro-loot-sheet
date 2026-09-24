/**
 * Updates `npcBuyable` in src/data/loot.json: can you buy the item from an NPC?
 *
 * Where the answer comes from, in order:
 *   1. uaRO's own changes (src/data/uaro-overrides.json, npcShops):
 *      notSoldByNpc -> "no"; uaroShops (checked in game) or soldByNpc -> "yes"
 *   2. Zeny shops in Hercules' pre-renewal NPC scripts -> "yes"
 *   3. uaRO's renewal shops, read from rAthena (npcShops.renewalShops) -> "yes"
 *   4. Otherwise -> "no"
 * An item already marked "npc-only" (only NPCs have it) stays "npc-only" when
 * it's sold. Items without an itemId are left as they are.
 *
 * NPC-sold items can't be vended or @whobuy'd, so when an item becomes sold
 * by NPCs, its Vend/Whobuy actions become NPC and its player prices are
 * cleared. Everything that changes is listed.
 *
 * Usage:
 *   npm run sync:shops             (update loot.json)
 *   npm run sync:shops -- --check  (only report, change nothing)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { loadPreRenewalItemDb } from './hercules.mjs';
import { loadRenewalItemDb } from './rathena.mjs';
import { loadShopItems } from './npc-shops.mjs';

const LOOT_FILE = 'src/data/loot.json';
const OVERRIDES_FILE = 'src/data/uaro-overrides.json';
const checkOnly = process.argv.includes('--check');

const items = JSON.parse(readFileSync(LOOT_FILE, 'utf8'));
const { npcShops } = JSON.parse(readFileSync(OVERRIDES_FILE, 'utf8'));

// Shops, as Map item ID -> [{ shop, map, currency }].
const herculesShops = await loadShopItems({
  repo: 'HerculesWS/Hercules',
  branch: 'stable',
  confFile: 'npc/pre-re/scripts_main.conf',
  itemDb: await loadPreRenewalItemDb(),
});
const rathenaShops = await loadShopItems({
  repo: 'rathena/rathena',
  branch: 'master',
  confFile: 'npc/re/scripts_main.conf',
  itemDb: await loadRenewalItemDb(),
});
const { maps: renewalMaps, shops: renewalShopNames } = npcShops.renewalShops;
const isUaroRenewalShop = (shop) => renewalMaps.includes(shop.map) || renewalShopNames.includes(shop.shop);

/** The zeny shops that sell this item, e.g. ["Tool Dealer (Hercules)"]. */
function zenyShops(itemId) {
  const hercules = (herculesShops.get(itemId) ?? []).filter((shop) => shop.currency === 'zeny');
  const rathena = (rathenaShops.get(itemId) ?? []).filter((shop) => shop.currency === 'zeny' && isUaroRenewalShop(shop));
  return [...new Set([...hercules.map((s) => `${s.shop} (Hercules)`), ...rathena.map((s) => `${s.shop} (rAthena)`)])];
}

const soldIds = new Set(npcShops.soldByNpc.items.map((entry) => entry.itemId));
// Item ID -> names of uaRO shops that sell it, e.g. ["Tool Dealer"].
const uaroShopsById = new Map();
for (const shop of npcShops.uaroShops.shops) {
  for (const entry of shop.items) uaroShopsById.set(entry.itemId, [...(uaroShopsById.get(entry.itemId) ?? []), shop.name]);
}
const notSoldIds = new Set(npcShops.notSoldByNpc.items.map((entry) => entry.itemId));

const changes = [];
const noItemId = [];
const updatedItems = items.map((item) => {
  if (item.itemId == null) {
    noItemId.push(item.name);
    return item;
  }
  const shops = zenyShops(item.itemId);
  let sold;
  let reason;
  if (notSoldIds.has(item.itemId)) [sold, reason] = [false, 'uaRO override'];
  else if (uaroShopsById.has(item.itemId)) [sold, reason] = [true, `uaRO ${uaroShopsById.get(item.itemId).join(', ')}`];
  else if (soldIds.has(item.itemId)) [sold, reason] = [true, 'uaRO override'];
  else if (shops.length) [sold, reason] = [true, shops.slice(0, 3).join(', ')];
  else [sold, reason] = [false, 'not in any shop'];

  const npcBuyable = sold ? (item.npcBuyable === 'npc-only' ? 'npc-only' : 'yes') : 'no';
  if (npcBuyable === item.npcBuyable) return item;

  const updated = { ...item, npcBuyable };
  const notes = [];
  if (sold) {
    // NPC-sold items aren't traded between players.
    if (item.actions.some((action) => action === 'Vend' || action === 'Whobuy')) {
      const actions = item.actions.map((action) => (action === 'Vend' || action === 'Whobuy' ? 'NPC' : action));
      updated.actions = [...new Set(actions)];
      notes.push(`actions ${item.actions.join('+')} -> ${updated.actions.join('+')}`);
    }
    for (const field of ['avgVend', 'avgWhobuy']) {
      if (item[field] != null) {
        updated[field] = null;
        notes.push(`cleared ${field} ${item[field]}`);
      }
    }
  }
  changes.push({ name: item.name, from: item.npcBuyable ?? 'blank', to: npcBuyable, reason, notes });
  return updated;
});

// Report. Blank -> "no" is the common, boring case, so it's just counted.
const filledNo = changes.filter((c) => c.from === 'blank' && c.to === 'no');
const other = changes.filter((c) => !filledNo.includes(c));
console.log(`${changes.length} items ${checkOnly ? 'would change' : 'changed'}.`);
console.log(`  ${filledNo.length} blank -> no (not in any shop)`);
for (const c of other) {
  console.log(`  ${c.name}: ${c.from} -> ${c.to} (${c.reason})${c.notes.length ? `; ${c.notes.join('; ')}` : ''}`);
}
if (noItemId.length) console.log(`\nNo itemId, left as-is: ${noItemId.join(', ')}`);

if (!checkOnly) {
  writeFileSync(LOOT_FILE, JSON.stringify(updatedItems, null, 2) + '\n');
  console.log(`\nWrote ${LOOT_FILE}. Next: npm run validate`);
}
