import { hasWhobuy, isSoldByNpc, isTradeable, npcSellPrice } from '../utils/prices.js';

/**
 * Admin work queues: short lists of items that need a look, each with the
 * reason it's there. Admin mode shows them instead of asking you to filter
 * the whole table (the Targets page works the same way).
 *
 * A queue is { id, title, description, select(items, ctx) }. `select` returns
 * rows as { item, reasons }, in the order to work through them. `ctx` is
 * { suggest }, the function from createSuggester() in utils/suggest.js.
 * Everything here is plain functions, so the tests and scripts can use it.
 */

const byName = (a, b) => a.item.name.localeCompare(b.item.name);

const sameActions = (a, b) => a.length === b.length && a.every((action) => b.includes(action));
const actionsText = (actions) => (actions.length ? actions.join(' + ') : 'none');

const hasPlayerPrice = (item) => item.avgVend != null || item.avgWhobuy != null;
const isNoUse = (item) => item.categories.includes('No Use');

/**
 * Vend or Whobuy is set, but there's no price to back it up. Items NPCs sell
 * or that can't be traded never have player prices, so they're left out.
 * Items used in more things come first: their price feeds more Keep decisions.
 */
function needsPrice(items) {
  const rows = [];
  for (const item of items) {
    if (isSoldByNpc(item) || !isTradeable(item)) continue;
    const reasons = [];
    if (item.actions.includes('Vend') && item.avgVend == null) reasons.push('Vend action, no vend price');
    if (item.actions.includes('Whobuy') && hasWhobuy(item) && item.avgWhobuy == null) reasons.push('Whobuy action, no @whobuy price');
    if (reasons.length) rows.push({ item, reasons });
  }
  return rows.sort((a, b) => b.item.uses.length - a.item.uses.length || byName(a, b));
}

/**
 * The suggested actions aren't the hand-set ones (the `npm run suggest`
 * report). Includes items with no action yet that now get a suggestion.
 * Items that share the same change sit together, biggest group first, so a
 * whole pattern can be reviewed in one go.
 */
function suggestionDiffers(items, { suggest }) {
  const rows = [];
  for (const item of items) {
    const { actions } = suggest(item);
    if (!actions.length || sameActions(item.actions, actions)) continue;
    const pattern = `${actionsText(item.actions)} → ${actionsText(actions)}`;
    rows.push({ item, reasons: [pattern], pattern });
  }
  const sizes = new Map();
  for (const row of rows) sizes.set(row.pattern, (sizes.get(row.pattern) ?? 0) + 1);
  return rows.sort((a, b) => sizes.get(b.pattern) - sizes.get(a.pattern) || a.pattern.localeCompare(b.pattern) || byName(a, b));
}

/** A price is set but nobody has checked it in game (lastVerified is empty). */
function unverifiedPrices(items) {
  return items.filter((item) => hasPlayerPrice(item) && !item.lastVerified).map((item) => ({ item, reasons: ['Price set, never verified'] })).sort(byName);
}

/**
 * Values that look wrong. A price of 0 isn't listed: it means "checked,
 * nobody's buying" (see suggest.js).
 */
function suspiciousValues(items) {
  const rows = [];
  for (const item of items) {
    const reasons = [];
    const npc = npcSellPrice(item);
    if (item.avgVend > 0 && npc != null && item.avgVend < npc) reasons.push('Vend price is below the NPC price');
    if (item.avgVend > 0 && !item.actions.includes('Vend') && !isSoldByNpc(item)) reasons.push('Has a vend price but no Vend action');
    if (item.avgWhobuy > 0 && !item.actions.includes('Whobuy') && !isSoldByNpc(item)) reasons.push('Has an @whobuy price but no Whobuy action');
    if (item.actions.includes('Keep') && !item.uses.length) reasons.push('Keep, but nothing uses it');
    if (item.actions.includes('Keep') && isNoUse(item)) reasons.push('Keep, but the category is No Use');
    if (reasons.length) rows.push({ item, reasons });
  }
  return rows.sort(byName);
}

/** Nothing says what the item is for: no uses and no notes, and it isn't marked No Use. */
function missingUses(items) {
  return items
    .filter((item) => !item.uses.length && !item.notes && !isNoUse(item) && !item.categories.includes('Not Reviewed'))
    .map((item) => ({ item, reasons: ['No uses or notes, and not marked No Use'] }))
    .sort(byName);
}

/** New items whose uses haven't been checked yet. */
function notReviewed(items) {
  return items.filter((item) => item.categories.includes('Not Reviewed')).map((item) => ({ item, reasons: ['Not reviewed'] })).sort(byName);
}

export const QUEUES = [
  { id: 'needs-price', title: 'Needs a price', description: 'Vend or Whobuy is set, but there is no price yet.', select: needsPrice },
  { id: 'suggestion-differs', title: 'Suggestion differs', description: 'The suggested actions are not the ones set by hand.', select: suggestionDiffers },
  { id: 'unverified-prices', title: 'Verify prices', description: 'A price is set, but it was never checked in game.', select: unverifiedPrices },
  { id: 'suspicious-values', title: 'Suspicious values', description: 'Numbers or actions that do not fit together.', select: suspiciousValues },
  { id: 'missing-uses', title: 'Missing uses', description: 'No uses or notes, and not marked No Use.', select: missingUses },
  { id: 'not-reviewed', title: 'Not reviewed', description: 'New items that need categories and uses.', select: notReviewed },
];

/** How many rows each queue has: { 'needs-price': 416, ... }. */
export function queueCounts(items, ctx) {
  return Object.fromEntries(QUEUES.map((queue) => [queue.id, queue.select(items, ctx).length]));
}
