import rules from '../data/game-rules.json';

/**
 * NPC sell prices. Items store `sellValue` (what an NPC pays before skills);
 * the NPC Sell column shows the price with Overcharge, using the same math as
 * Hercules (src/map/pc.cpp, pc_modifysellvalue): value * (100 + bonus%) / 100,
 * rounded down.
 *
 * The level and bonus come from src/data/game-rules.json, which
 * `npm run sync:hercules` reads from Hercules' code.
 */
export const OVERCHARGE_LEVEL = rules.overchargeLevel;
export const OVERCHARGE_PERCENT = rules.overchargePercent;

/** Zeny an NPC pays for one, with Overcharge. null if the sell value is unknown. */
export function npcSellPrice(item) {
  if (item.sellValue == null) return null;
  return Math.floor((item.sellValue * (100 + OVERCHARGE_PERCENT)) / 100);
}
