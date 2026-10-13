import rules from '../data/game-rules.json' with { type: 'json' };
import overrides from '../data/uaro-overrides.json' with { type: 'json' };

/**
 * NPC sell prices.
 *
 * Items store `sellValue` (what an NPC pays before skills). The NPC
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

/** NPCs sell this item (so players don't vend it). */
export const isSoldByNpc = (item) => item.npcBuyable === 'yes' || item.npcBuyable === 'npc-only';

const NOT_TRADEABLE = new Set(overrides.tradeRestrictions.notTradeable.items.map((entry) => entry.itemId));

/** Players can trade this item (uaro-overrides.json, tradeRestrictions.notTradeable). */
export const isTradeable = (item) => !NOT_TRADEABLE.has(item.itemId);

export const isCard = (item) => item.categories.includes('Card');

/**
 * Cooked food that gives +6 or more ("+9 INT for 20 minutes"). Players pay
 * far more than NPCs for it, so, like cards, it always sells to players.
 */
export function isStrongFood(item) {
  if (!item.categories.includes('Cooking')) return false;
  const stat = /^\+(\d+) [A-Z]{3} for \d+ minutes$/.exec(item.notes ?? '');
  return Boolean(stat) && Number(stat[1]) >= 6;
}

/**
 * How an item's vend price compares with what an NPC pays, as one of:
 *   "unknown"  no vend price yet
 *   "none"     checked, and nobody was selling it (price 0)
 *   "higher"   players pay more than the NPC
 *   "lower"    players pay the same or less
 * This is all the public site gets: the vend prices themselves are kept in
 * a private file (see scripts/private-data.mjs) and loot.json only stores
 * this result, in the item's `vend` field.
 */
export function vendFlag(item) {
  if (item.avgVend == null) return 'unknown';
  if (item.avgVend === 0) return 'none';
  return item.avgVend > (npcSellPrice(item) ?? 0) ? 'higher' : 'lower';
}

/**
 * The item's vend state. Worked out from the price while it's there (admin
 * mode and the scripts load the private prices, so it's live while editing),
 * and read from the stored `vend` flag otherwise (the published site).
 */
export const vendState = (item) => (item.avgVend !== undefined ? vendFlag(item) : (item.vend ?? 'unknown'));

/** A pet taming item (notes "<Pet> Taming Item"). */
export const isTamingItem = (item) => item.categories.includes('Pet') && /Taming Item$/.test(item.notes ?? '');

/**
 * What an NPC pays (with Overcharge, in zeny) below which an item is worth
 * vending, for the kinds of item players are known to pay more for.
 */
const CHEAP_EQUIPMENT_LIMIT = 3000;
const CHEAP_TAMING_ITEM_LIMIT = 1000;

/**
 * Equipment under 3,000z at NPCs, or a taming item under 1,000z, that has no
 * vend price yet. A player price is very likely higher, so it's treated as
 * vend until a price says otherwise. A known price (even 0) ends this.
 */
export function isCheapUnpriced(item) {
  if (vendState(item) !== 'unknown') return false;
  const npc = npcSellPrice(item) ?? Infinity;
  if (item.itemType === 'Equipment') return npc < CHEAP_EQUIPMENT_LIMIT;
  return isTamingItem(item) && npc < CHEAP_TAMING_ITEM_LIMIT;
}

/**
 * Items that sell to players without a price to go on: cards, strong food,
 * and cheap equipment or taming items with no vend price yet.
 */
export const alwaysSoldToPlayers = (item) => isCard(item) || isStrongFood(item) || isCheapUnpriced(item);

/**
 * A pet accessory (notes "<Pet> Pet accessory") that nobody is selling
 * (vend price 0). Not worth anything to players, so it's Junk even though an
 * NPC would pay a few zeny.
 */
export const isUnsoldPetAccessory = (item) => vendState(item) === 'none' && /Pet accessory$/.test(item.notes ?? '');

/**
 * Which way of selling pays more, when there's a vend price to go on:
 * "vend" (players pay more than the NPC) or "npc" (the NPC pays the same or
 * more, or nobody is selling it to players). null when it can't be told:
 * NPCs sell it, it can't be traded, the vend price is unknown, or neither
 * pays anything. The site shows a star on the winner instead of the vend
 * price. An NPC that won't buy it counts as 0z, like the suggester does.
 *
 * Cards, strong food (+6 or more) and cheap equipment or taming items with no
 * vend price are "vend", even before they have a price (see
 * alwaysSoldToPlayers). Pet accessories nobody is selling are junk (see
 * isUnsoldPetAccessory). Neither gets the NPC star.
 *
 * Only the vend state is used (see vendState), never the price itself.
 */
export function bestSale(item) {
  if (isSoldByNpc(item) || !isTradeable(item)) return null;
  if (alwaysSoldToPlayers(item)) return 'vend';
  const state = vendState(item);
  if (state === 'unknown' || isUnsoldPetAccessory(item)) return null;
  if (state === 'higher') return 'vend';
  return (npcSellPrice(item) ?? 0) > 0 ? 'npc' : null;
}

/** Just the number (for sorting). null when it can't be sold or is unknown. */
export function npcSellPrice(item) {
  const info = npcSellInfo(item);
  return info.price ?? null;
}
