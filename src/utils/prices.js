import rules from '../data/game-rules.json';
import overrides from '../data/uaro-overrides.json';

/**
 * NPC sell prices.
 *
 * Items store `sellValue` (what an NPC pays before skills). The NPC Sell
 * column normally shows the price with Overcharge, using the same math as
 * Hercules (src/map/pc.cpp, pc_modifysellvalue): value * (100 + bonus%) / 100,
 * rounded down. The level and bonus come from src/data/game-rules.json.
 *
 * uaRO's own changes (src/data/uaro-overrides.json) come first:
 *   - notSellableToNpc:   NPCs won't buy it at all
 *   - modifiedSellPrices: a fixed price that Overcharge doesn't raise
 *   - customSellValues:   a different base price (Overcharge still applies)
 */
export const OVERCHARGE_LEVEL = rules.overchargeLevel;
export const OVERCHARGE_PERCENT = rules.overchargePercent;

const byItemId = (list, pick) => new Map(list.items.map((entry) => [entry.itemId, pick(entry)]));
const NOT_SELLABLE = byItemId(overrides.notSellableToNpc, (entry) => entry.reason);
const MODIFIED_PRICES = byItemId(overrides.modifiedSellPrices, (entry) => entry.price);
const CUSTOM_SELL_VALUES = byItemId(overrides.customSellValues, (entry) => entry.sellValue);

const withOvercharge = (value) => Math.floor((value * (100 + OVERCHARGE_PERCENT)) / 100);

/**
 * What an NPC pays for one of this item, as one of:
 *   { kind: 'not-sellable', reason }   NPCs won't buy it (uaRO rule)
 *   { kind: 'modified', price }        uaRO fixed price; Overcharge doesn't apply
 *   { kind: 'overcharge', price }      normal price with Overcharge
 *   { kind: 'unknown' }                no price data yet
 */
export function npcSellInfo(item) {
  if (NOT_SELLABLE.has(item.itemId)) return { kind: 'not-sellable', reason: NOT_SELLABLE.get(item.itemId) };
  if (MODIFIED_PRICES.has(item.itemId)) return { kind: 'modified', price: MODIFIED_PRICES.get(item.itemId) };
  const base = CUSTOM_SELL_VALUES.get(item.itemId) ?? item.sellValue;
  if (base == null) return { kind: 'unknown' };
  return { kind: 'overcharge', price: withOvercharge(base) };
}

/** Just the number (for sorting). null when it can't be sold or is unknown. */
export function npcSellPrice(item) {
  const info = npcSellInfo(item);
  return info.price ?? null;
}
