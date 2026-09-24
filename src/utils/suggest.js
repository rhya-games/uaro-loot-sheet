import targetData from '../data/use-targets.json' with { type: 'json' };
import { hasWhobuy, isSoldByNpc, isTradeable, npcSellPrice } from './prices.js';

/**
 * Suggested actions, worked out from prices instead of set by hand.
 *
 * Selling: NPC, @whobuy and vending take more and more effort, and player
 * prices move around. So a player price has to beat the NPC price by a
 * margin before it's worth the trouble:
 *   - Whobuy when it pays more than WHOBUY_MARGIN above the NPC price.
 *   - Vend when it pays more than VEND_MARGIN above the NPC price, and more
 *     than @whobuy at all.
 *   - NPC otherwise, and always for items NPCs sell or that can't be traded.
 *   - Cards are always Vend, even with no price yet: players pay far more
 *     than NPCs for any card.
 *
 * Keeping: for each "Used For" target, compare what the finished thing is
 * worth with what all its parts would sell for. If the finished thing is
 * worth more, its parts are worth keeping. Keep is suggested next to the
 * sell action ("keep it if you want, sell it if you want money").
 *
 * Junk: nothing uses it, and nobody pays anything for it.
 */
export const WHOBUY_MARGIN = 0.15;
export const VEND_MARGIN = 0.15;

const TARGET_VALUES = new Map(targetData.items.map((entry) => [entry.for, entry.value]));
const withoutSlots = (name) => name.replace(/\s*\[\d\]$/, '');

/**
 * The best way to sell one of this item, as
 * { action, price, reason } or null when there's no price to go on yet.
 */
export function suggestSale(item) {
  const npc = npcSellPrice(item);
  if (isSoldByNpc(item)) return { action: 'NPC', price: npc, reason: 'NPCs sell it, so players won’t buy it' };
  const tradeable = isTradeable(item);
  const whobuy = tradeable && hasWhobuy(item) ? item.avgWhobuy : null;
  const vend = tradeable ? item.avgVend : null;
  const floor = npc ?? 0;

  if (tradeable && item.categories.includes('Card')) {
    return { action: 'Vend', price: vend, reason: 'Cards always sell to players' + (vend != null ? ` (${fmt(vend)})` : '') };
  }

  if (vend != null && vend > floor * (1 + VEND_MARGIN) && vend > (whobuy ?? 0)) {
    return { action: 'Vend', price: vend, reason: `Vending pays the most (${fmt(vend)})` };
  }
  if (whobuy != null && whobuy > floor * (1 + WHOBUY_MARGIN)) {
    return { action: 'Whobuy', price: whobuy, reason: `@whobuy pays ${fmt(whobuy)}, more than NPCs` };
  }
  // No vend price yet, and no @whobuy buyers to go on: we can't tell
  // whether players pay more, so don't guess NPC (cards would all come out
  // as NPC). A Whobuy of 0 means "checked, nobody's buying".
  if (tradeable && vend == null && !(whobuy > 0)) return null;
  if (npc > 0) {
    const closest = Math.max(whobuy ?? 0, vend ?? 0);
    const reason = closest > npc
      ? `Players pay ${fmt(closest)}, not enough more than NPCs (${fmt(npc)}) to be worth it`
      : `NPCs pay the most (${fmt(npc)})`;
    return { action: 'NPC', price: npc, reason };
  }
  // Players and NPCs pay nothing.
  return { action: null, price: 0, reason: tradeable ? 'Players and NPCs pay nothing for it' : 'Can’t be traded, and NPCs pay nothing' };
}

/** A formatted zeny amount, like "12,000z". */
const fmt = (zeny) => `${zeny.toLocaleString('en-US')}z`;

/**
 * Makes a function that suggests actions for any item in `items`. It
 * indexes every recipe once, so calling it for each item stays fast.
 *
 * The result is { actions, sale, uses, reasons }:
 *   actions  suggested actions, like ['Keep', 'Vend'] (empty when unsure)
 *   sale     suggestSale()'s result
 *   uses     each use with { for, worthIt, value, partsValue, missingPrices }
 *   reasons  plain-language lines explaining the suggestion
 */
export function createSuggester(items) {
  const byName = new Map(items.map((item) => [item.name, item]));
  const bySlotlessName = new Map();
  for (const item of items) {
    const key = withoutSlots(item.name);
    bySlotlessName.set(key, bySlotlessName.has(key) ? null : item); // null = more than one match
  }
  const findItem = (name) => byName.get(name) ?? bySlotlessName.get(withoutSlots(name)) ?? null;

  // Every material of each target, with quantities.
  const partsOf = new Map();
  for (const item of items) {
    for (const use of item.uses) {
      if (!partsOf.has(use.for)) partsOf.set(use.for, []);
      partsOf.get(use.for).push({ item, qty: use.qty ?? 1 });
    }
  }

  const sales = new Map();
  const saleOf = (item) => {
    if (!sales.has(item)) sales.set(item, suggestSale(item));
    return sales.get(item);
  };

  /** What the finished thing is worth: { value, source } (value null = unknown). */
  function targetValue(target) {
    if (TARGET_VALUES.has(target)) return { value: TARGET_VALUES.get(target), source: 'use-targets.json' };
    const item = findItem(target);
    if (!item) return { value: null, source: 'not loot' };
    // A finished item is worth the most players pay for it. The NPC price
    // doesn't count: it's the floor, not what the item is worth to use
    // (Elemental Converters sell to NPCs for 1z).
    const prices = [item.avgWhobuy, item.avgVend].filter((price) => price != null);
    return { value: prices.length ? Math.max(...prices) : null, source: 'sheet' };
  }

  function judgeUse(use) {
    const { value, source } = targetValue(use.for);
    let partsValue = 0;
    let missingPrices = 0;
    for (const part of partsOf.get(use.for)) {
      const price = saleOf(part.item)?.price;
      if (price == null) missingPrices++;
      else partsValue += price * part.qty;
    }
    // No value yet: keep, to be safe. Only prices can talk us out of it.
    const worthIt = value == null || value > partsValue;
    return { for: use.for, worthIt, value, source, partsValue, missingPrices };
  }

  return function suggest(item) {
    const sale = saleOf(item);
    const uses = item.uses.map(judgeUse);
    const reasons = [];
    const actions = [];

    const worthKeeping = uses.filter((use) => use.worthIt);
    if (worthKeeping.length) {
      actions.push('Keep');
      for (const use of worthKeeping) {
        reasons.push(use.value == null
          ? `Keep for ${use.for} (no value set, so keep to be safe)`
          : `Keep for ${use.for}: worth ${fmt(use.value)}, parts sell for ${fmt(use.partsValue)}${use.missingPrices ? ` (${use.missingPrices} parts have no price)` : ''}`);
      }
    }
    for (const use of uses.filter((use) => !use.worthIt)) {
      reasons.push(`Not worth making ${use.for}: worth ${fmt(use.value)}, parts sell for ${fmt(use.partsValue)}`);
    }

    if (sale?.action) {
      actions.push(sale.action);
      reasons.push(sale.reason);
    } else if (sale && !item.uses.length) {
      actions.push('Junk');
      reasons.push(sale.reason);
    } else if (!sale) {
      reasons.push('No player price yet');
    }
    return { actions, sale, uses, reasons };
  };
}
