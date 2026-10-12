import { hasWhobuy, isSoldByNpc, isTradeable, npcSellPrice } from '../utils/prices.js';
import { valueTargets } from '../utils/targets.js';

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
 * Whether this price ("avgVend" or "avgWhobuy") is set to be used (the
 * item has the Vend or Whobuy action) but is still empty. Items NPCs sell or
 * that can't be traded never have player prices, and @whobuy doesn't apply
 * to cards or equipment.
 *
 * An item with no action at all needs both: the suggester can't pick an
 * action without a player price, so without a box here these items would
 * wait in no queue. Saving a price sets the action (see AdminContext).
 */
export function needsField(item, field) {
  if (isSoldByNpc(item) || !isTradeable(item) || item[field] != null) return false;
  if (item.actions.length === 0) return field === 'avgVend' || hasWhobuy(item);
  return field === 'avgVend' ? item.actions.includes('Vend') : item.actions.includes('Whobuy') && hasWhobuy(item);
}

/**
 * Whether this price can be set at all for the item: it can be traded, NPCs
 * don't sell it, and (for @whobuy) it isn't a card or equipment. The queue
 * rows show a box for every such price, so Vend and Whobuy can both be
 * filled in before the row leaves the list.
 */
export function canHavePrice(item, field) {
  if (isSoldByNpc(item) || !isTradeable(item)) return false;
  return field === 'avgVend' || hasWhobuy(item);
}

/**
 * How soon an item's price is wanted, by quest relevance (0 comes first).
 * An item takes the best tier of its categories; a category that isn't
 * listed is the default tier. The aim is to price what players actually
 * chase on this server before the official game's hat quests, which are
 * low priority.
 */
const DEFAULT_PRIORITY = 2;
const PRICE_PRIORITY = {
  'Server Hat Quest': 0, // Dimonka's headgear quests, added by this server
  'Pet Evolution': 1,
  'Repeatable Quest': 1,
  'Dungeon Quest': 1,
  'Job Quest': 1,
  'Other Quest': 1,
  'Official Hat Quest': 3, // low: only if nothing better applies
  'No Use': 3, // nothing to keep it for, so only its sell price matters
};

/** The item's pricing priority: 0 (first) to 3 (last). Exported for the tests. */
export function pricePriority(item) {
  if (!item.categories.length) return DEFAULT_PRIORITY;
  return Math.min(...item.categories.map((category) => PRICE_PRIORITY[category] ?? DEFAULT_PRIORITY));
}

/**
 * Targets the parts can't place: every part is in both hat quest categories,
 * so there is no vote. Set by hand (the maintainer), as target name -> tier.
 */
const TARGET_PRIORITY_OVERRIDES = {
  'Bunny Band': PRICE_PRIORITY['Official Hat Quest'],
  'Kitsune Mask': PRICE_PRIORITY['Official Hat Quest'],
};

/**
 * The same priority for a "Used For" target (a hat, a pet evolution, a
 * weapon quest), which has no categories of its own. Its parts' categories
 * say what it is:
 *   - A target in TARGET_PRIORITY_OVERRIDES uses that tier.
 *   - "<pet> Pet Evolution" (some have a note after it) is a pet evolution.
 *   - Otherwise each part votes with its quest categories (Server Hat Quest,
 *     Other Quest, Official Hat Quest...). A part also used for something
 *     else would drag a target up if the best vote won, so the most common
 *     vote wins, and the better tier takes a tie.
 *   - Parts with no quest category don't vote, nor do parts in both hat
 *     quest categories (they could belong to either), nor Pet Evolution
 *     (a part can serve a pet and a hat).
 *   - No votes: the default tier.
 * `partItems` are the loot items that are parts of the target.
 */
export function targetPriority(targetName, partItems) {
  if (targetName in TARGET_PRIORITY_OVERRIDES) return TARGET_PRIORITY_OVERRIDES[targetName];
  if (/ Pet Evolution\b/.test(targetName)) return PRICE_PRIORITY['Pet Evolution'];
  const votes = new Map();
  for (const item of partItems) {
    if (item.categories.includes('Server Hat Quest') && item.categories.includes('Official Hat Quest')) continue;
    const tiers = item.categories
      .filter((category) => category in PRICE_PRIORITY && category !== 'Pet Evolution' && category !== 'No Use')
      .map((category) => PRICE_PRIORITY[category]);
    if (tiers.length) votes.set(Math.min(...tiers), (votes.get(Math.min(...tiers)) ?? 0) + 1);
  }
  if (!votes.size) return DEFAULT_PRIORITY;
  return [...votes].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
}

/**
 * Prices to fill in. Two kinds of item:
 *   - one price is set and another it can have is empty (started and left)
 *   - Vend or Whobuy is set (or no action yet), but there's no price
 * Order: pricing priority by quest relevance (pricePriority), then the items
 * used in the most things, whichever kind: their price feeds the most Keep
 * decisions. Of two items used equally, the half-priced one goes first, since
 * it's quickest to finish.
 */
function needsPrice(items) {
  const rows = [];
  for (const item of items) {
    const reasons = [];
    const noAction = item.actions.length === 0;
    if (needsField(item, 'avgVend')) reasons.push(noAction ? 'No action yet, no vend price' : 'Vend action, no vend price');
    if (needsField(item, 'avgWhobuy')) reasons.push(noAction ? 'No action yet, no @whobuy price' : 'Whobuy action, no @whobuy price');
    const half = hasPlayerPrice(item) && (canHavePrice(item, 'avgVend') && item.avgVend == null || canHavePrice(item, 'avgWhobuy') && item.avgWhobuy == null);
    if (half && !reasons.length) {
      reasons.push(item.avgVend == null ? 'Has a @whobuy price, no vend price' : 'Has a vend price, no @whobuy price');
    }
    if (reasons.length) rows.push({ item, reasons, half, priority: pricePriority(item) });
  }
  return rows.sort((a, b) => a.priority - b.priority || b.item.uses.length - a.item.uses.length || b.half - a.half || byName(a, b));
}

/**
 * Whether a "Keep mine" review (an entry of reviewed-suggestions.json) still
 * applies: the item's actions and its suggestion are both what they were
 * when it was reviewed. If either changed, it needs another look.
 */
export function isReviewed(entry, item, suggested) {
  return Boolean(entry) && sameActions(entry.actions, item.actions) && sameActions(entry.suggested, suggested);
}

/**
 * The suggested actions aren't the hand-set ones (the `npm run suggest`
 * report). Includes items with no action yet that now get a suggestion.
 * Items reviewed with "Keep mine" stay out while the review applies
 * (`ctx.reviewed`, a Map of item id -> entry). Items that share the same
 * change sit together, biggest group first, so a whole pattern can be
 * reviewed in one go.
 *
 * Rows also carry `suggested`, the suggested actions.
 */
function suggestionDiffers(items, { suggest, reviewed = new Map() }) {
  const rows = [];
  for (const item of items) {
    const { actions } = suggest(item);
    if (!actions.length || sameActions(item.actions, actions) || isReviewed(reviewed.get(item.id), item, actions)) continue;
    const pattern = `${actionsText(item.actions)} → ${actionsText(actions)}`;
    rows.push({ item, reasons: [pattern], pattern, suggested: actions });
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
 * A category that already says what the item is for, so a missing "Used For"
 * line isn't a gap: pet items (taming items, accessories and evolution
 * materials; the pet is the purpose), dungeon quest items and cooking
 * ingredients.
 */
const PURPOSE_CATEGORIES = ['Pet', 'Dungeon Quest', 'Cooking'];
const hasPurposeCategory = (item) => item.categories.some((category) => PURPOSE_CATEGORIES.includes(category));

/**
 * Values that look wrong. A price of 0 isn't listed: it means "checked,
 * nobody's buying" (see suggest.js). Nor is a vend price below the NPC
 * price: players do that, and it says nothing is wrong with the data. A
 * price without its action isn't listed when a better way to sell explains
 * it (the NPC pays more than vend, or vend pays more than @whobuy).
 */
function suspiciousValues(items) {
  const rows = [];
  for (const item of items) {
    const reasons = [];
    // An NPC that pays more than the vend price is why Vend is left out (see suggest.js), so it's not suspicious.
    const npc = npcSellPrice(item);
    const npcPaysMore = npc != null && npc > item.avgVend;
    if (item.avgVend > 0 && !npcPaysMore && !item.actions.includes('Vend') && !isSoldByNpc(item)) reasons.push('Has a vend price but no Vend action');
    // A vend price above the @whobuy price is why Whobuy is left out (see suggest.js), so it's not suspicious.
    const vendPaysMore = item.avgVend != null && item.avgVend > item.avgWhobuy;
    if (item.avgWhobuy > 0 && !vendPaysMore && !item.actions.includes('Whobuy') && !isSoldByNpc(item)) reasons.push('Has an @whobuy price but no Whobuy action');
    // Items in a purpose category are kept for it, which has no "Used For" line.
    if (item.actions.includes('Keep') && !item.uses.length && !hasPurposeCategory(item)) reasons.push('Keep, but nothing uses it');
    if (item.actions.includes('Keep') && isNoUse(item)) reasons.push('Keep, but the category is No Use');
    if (reasons.length) rows.push({ item, reasons });
  }
  return rows.sort(byName);
}

/** Nothing says what the item is for: no uses and no notes, and it isn't marked No Use. Cards (used as they are) and items with a purpose category are left out. */
function missingUses(items) {
  return items
    .filter((item) => !item.uses.length && !item.notes && !isNoUse(item) && !item.categories.includes('Not Reviewed') && !item.categories.includes('Card') && !hasPurposeCategory(item))
    .map((item) => ({ item, reasons: ['No uses or notes, and not marked No Use'] }))
    .sort(byName);
}

/** New items whose uses haven't been checked yet. */
function notReviewed(items) {
  return items.filter((item) => item.categories.includes('Not Reviewed')).map((item) => ({ item, reasons: ['Not reviewed'] })).sort(byName);
}

export const QUEUES = [
  { id: 'needs-price', title: 'Needs a price', description: 'Vend or Whobuy is set (or no action yet), but there is no price yet.', select: needsPrice },
  { id: 'suggestion-differs', title: 'Suggestion differs', description: 'The suggested actions are not the ones set by hand.', select: suggestionDiffers },
  { id: 'unverified-prices', title: 'Verify prices', description: 'A price is set, but it was never checked in game.', select: unverifiedPrices },
  { id: 'suspicious-values', title: 'Suspicious values', description: 'Numbers or actions that do not fit together.', select: suspiciousValues },
  { id: 'missing-uses', title: 'Missing uses', description: 'No uses or notes, and not marked No Use.', select: missingUses },
  { id: 'not-reviewed', title: 'Not reviewed', description: 'New items that need categories and uses.', select: notReviewed },
];

/** How many rows each queue has: { 'needs-price': 420, ... }. */
export function queueCounts(items, ctx) {
  return Object.fromEntries(QUEUES.map((queue) => [queue.id, queue.select(items, ctx).length]));
}

/**
 * How many "Used For" targets still need a value (the Targets page).
 * `values` is a Map of target name -> value, like use-targets.json.
 */
export function targetsNeedingValue(items, values) {
  return [...valueTargets(items).keys()].filter((name) => !values.has(name)).length;
}
