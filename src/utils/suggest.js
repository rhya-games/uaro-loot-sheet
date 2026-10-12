import targetData from '../data/use-targets.json' with { type: 'json' };
import { hasWhobuy, isSoldByNpc, isTradeable, npcSellPrice } from './prices.js';

/**
 * Suggested actions, worked out from prices instead of set by hand.
 *
 * Selling: NPC, @whobuy and vending take more and more effort, but a
 * player price that beats the NPC price by even 1z is worth it, so there's
 * no margin (a percentage rule left real vend prices as NPC):
 *   - Whobuy when it pays more than the NPC price.
 *   - Vend when it pays more than the NPC price, and more than @whobuy.
 *   - NPC otherwise, and always for items NPCs sell or that can't be traded.
 *   - Cards are always Vend, even with no price yet: players pay far more
 *     than NPCs for any card.
 *
 * Keeping: for each "Used For" target, compare what the finished thing is
 * worth with what all its parts would sell for. If the finished thing is
 * worth more, its parts are worth keeping. Keep is suggested next to the
 * sell action ("keep it if you want, sell it if you want money"). Keep is
 * never the only action: with no player price yet, Vend goes next to it.
 *   - Quests can't be bought or sold, so they have no value to compare:
 *     a quest use is always a reason to Keep (see isQuest).
 *   - Uses that don't use the item up (a weapon that breaks the Sign Quest
 *     seal, a whip for Zealotus Mask, a recipe book) aren't: one is enough,
 *     so extras sell by price (see isNotUsedUp).
 *   - Skills (a Blue Gemstone for Safety Wall) aren't either: people who
 *     cast them buy or keep their own, so the item sells by price (see isSkill).
 *   - A target checked with no shops selling it (value 0 in
 *     use-targets.json) can only be made, so its parts are worth keeping.
 *   - Cooking levels 1-3 don't count: those foods are too weak to be worth
 *     keeping ingredients for (see isLowLevelCooking).
 *   - A cooking kit (the "Cooking" use) is used up with every dish, and
 *     there's no one finished thing to compare, so it's a reason to Keep
 *     unless NPCs sell it (then it's easy to buy again; see isCooking).
 *   - Job quests ("Crusader Job Quest") don't count: they're done once, so
 *     the item sells by price. They're still listed under "Used For" (see
 *     isJobQuest).
 *
 * Junk: nothing uses it, and nobody pays anything for it.
 */

/**
 * A use for level 1-3 cooking: a food whose note says "+1" to "+3"
 * ("+3 VIT food"), or the trade for a Level 1-3 Cookbook. Not a reason to Keep.
 */
export const isLowLevelCooking = (use) =>
  /^\+[1-3] [A-Z]{3} food$/.test(use.note ?? '') || /^Level [1-3] Cookbook$/.test(use.for);

/** A quest ("Sign Quest", "Episode 13 Quests"). Not "Level 4 weapon quest" uses: those make a weapon with a price. */
export const isQuest = (use) => /\bQuests?\b/.test(use.for);

/** A job change quest ("Archer Job Quest"). Listed as a use, but not a reason to Keep. */
export const isJobQuest = (use) => /\bJob Quest\b/.test(use.for);

/** What a cooking kit is used for: any dish, so it has no single target to price. */
export const isCooking = (use) => use.for === 'Cooking';

/** A use that needs the item but doesn't take it ("any whip; not used up"). */
export const isNotUsedUp = (use) => /\bnot used up\b/.test(use.note ?? '');

/** A skill that uses the item up when cast ("each cast"). */
export const isSkill = (use) => use.note === 'each cast';

/** Uses that can be a reason to Keep (the rest never are). */
const isKeepReason = (use) => !isLowLevelCooking(use) && !isNotUsedUp(use) && !isSkill(use) && !isJobQuest(use);

/** use-targets.json as a Map: target name -> value. */
export const TARGET_VALUES = new Map(targetData.items.map((entry) => [entry.for, entry.value]));
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

  if (vend != null && vend > floor && vend > (whobuy ?? 0)) {
    return { action: 'Vend', price: vend, reason: `Vending pays the most (${fmt(vend)})` };
  }
  if (whobuy != null && whobuy > floor) {
    return { action: 'Whobuy', price: whobuy, reason: `@whobuy pays ${fmt(whobuy)}, more than NPCs` };
  }
  // No vend price yet, and no @whobuy buyers to go on: we can't tell
  // whether players pay more, so don't guess NPC (cards would all come out
  // as NPC). A Whobuy of 0 means "checked, nobody's buying".
  if (tradeable && vend == null && !(whobuy > 0)) return null;
  if (npc > 0) {
    return { action: 'NPC', price: npc, reason: `NPCs pay the most (${fmt(npc)})` };
  }
  // Players and NPCs pay nothing.
  return { action: null, price: 0, reason: tradeable ? 'Players and NPCs pay nothing for it' : 'Can’t be traded, and NPCs pay nothing' };
}

/** A formatted zeny amount, like "12,000z". */
const fmt = (zeny) => `${zeny.toLocaleString('en-US')}z`;

/**
 * Makes a function that suggests actions for any item in `items`. It
 * indexes every recipe once, so calling it for each item stays fast.
 * `targetValues` overrides use-targets.json (admin mode passes its edits).
 *
 * The result is { actions, sale, uses, reasons }:
 *   actions  suggested actions, like ['Keep', 'Vend'] (empty when unsure)
 *   sale     suggestSale()'s result
 *   uses     each use with { for, worthIt, value, partsValue, missingPrices }
 *   reasons  plain-language lines explaining the suggestion
 */
export function createSuggester(items, targetValues = TARGET_VALUES) {
  const byName = new Map(items.map((item) => [item.name, item]));
  const bySlotlessName = new Map();
  for (const item of items) {
    const key = withoutSlots(item.name);
    bySlotlessName.set(key, bySlotlessName.has(key) ? null : item); // null = more than one match
  }
  const findItem = (name) => byName.get(name) ?? bySlotlessName.get(withoutSlots(name)) ?? null;

  // Every material of each target, with quantities. Things that aren't used
  // up cost nothing to make it.
  const partsOf = new Map();
  for (const item of items) {
    for (const use of item.uses) {
      if (isNotUsedUp(use)) continue;
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
    // 0 = checked, and no shops sell it: no price to compare, and it can only be made.
    if (targetValues.get(target) === 0) return { value: null, source: 'no shops' };
    if (targetValues.has(target)) return { value: targetValues.get(target), source: 'use-targets.json' };
    const item = findItem(target);
    if (!item) return { value: null, source: 'not loot' };
    // A finished item is worth the most players pay for it. The NPC price
    // doesn't count: it's the floor, not what the item is worth to use
    // (Elemental Converters sell to NPCs for 1z).
    const prices = [item.avgWhobuy, item.avgVend].filter((price) => price != null);
    return { value: prices.length ? Math.max(...prices) : null, source: 'sheet' };
  }

  function judgeUse(use) {
    if (isQuest(use)) return { for: use.for, worthIt: true, value: null, source: 'quest', partsValue: 0, missingPrices: 0 };
    if (isCooking(use)) return { for: use.for, worthIt: true, value: null, source: 'cooking', partsValue: 0, missingPrices: 0 };
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
    // NPC-sold cooking kits are easy to buy again, so they aren't kept.
    const npcSoldKit = isSoldByNpc(item) && item.uses.some(isCooking);
    const uses = item.uses.filter((use) => isKeepReason(use) && !(npcSoldKit && isCooking(use))).map(judgeUse);
    const reasons = [];
    const actions = [];

    const worthKeeping = uses.filter((use) => use.worthIt);
    if (worthKeeping.length) {
      actions.push('Keep');
      for (const use of worthKeeping) {
        reasons.push(use.source === 'quest'
          ? `Keep for ${use.for} (quests can’t be bought)`
          : use.source === 'cooking'
          ? `Keep for cooking (a kit is used up with every dish)`
          : use.source === 'no shops'
          ? `Keep for ${use.for} (no shops sell it, so it can only be made)`
          : use.value == null
          ? `Keep for ${use.for} (no value set, so keep to be safe)`
          : `Keep for ${use.for}: worth ${fmt(use.value)}, parts sell for ${fmt(use.partsValue)}${use.missingPrices ? ` (${use.missingPrices} parts have no price)` : ''}`);
      }
    }
    const lowCooking = item.uses.filter(isLowLevelCooking).length;
    if (lowCooking) reasons.push(`Level 1–3 cooking (${lowCooking} uses) isn’t a reason to keep it`);
    const notUsedUp = item.uses.filter(isNotUsedUp).map((use) => use.for);
    if (notUsedUp.length) reasons.push(`${notUsedUp.join(', ')} doesn’t use it up, so one is enough: not a reason to keep more`);
    const skills = item.uses.filter(isSkill).map((use) => use.for);
    if (skills.length) reasons.push(`Skills (${skills.join(', ')}) aren’t a reason to keep it`);
    if (npcSoldKit) reasons.push('NPCs sell it, so there’s no need to keep it for cooking');
    const jobQuests = item.uses.filter(isJobQuest).map((use) => use.for);
    if (jobQuests.length) reasons.push(`Job quests (${jobQuests.join(', ')}) aren’t a reason to keep it`);
    for (const use of uses.filter((use) => !use.worthIt)) {
      reasons.push(`Not worth making ${use.for}: worth ${fmt(use.value)}, parts sell for ${fmt(use.partsValue)}`);
    }

    // Something that still needs it (a Sign Quest weapon, a skill, a job quest) isn't Junk.
    const usedFor = uses.length + (npcSoldKit ? 1 : 0) + notUsedUp.length + skills.length + jobQuests.length;
    if (sale?.action) {
      actions.push(sale.action);
      reasons.push(sale.reason);
    } else if (sale && !usedFor) {
      actions.push('Junk');
      reasons.push(sale.reason);
    } else if (!sale && actions.includes('Keep')) {
      // Keep is never the only action: extras can always be sold. With no
      // price to go on, vending is the usual way (the price comes later).
      actions.push('Vend');
      reasons.push('No player price yet, so Vend until one is set');
    } else if (!sale) {
      reasons.push('No player price yet');
    }
    return { actions, sale, uses, reasons };
  };
}
