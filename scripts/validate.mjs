/**
 * Checks src/data/loot.json for mistakes before you commit.
 *
 * Usage: npm run validate
 *
 * ERRORS   = must be fixed (the site may break). Exits with code 1.
 * WARNINGS = worth a look, but won't block anything.
 */
import { readFileSync } from 'node:fs';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { CHANGELOG } from '../src/data/changelog.js';

const DATA_FILE = 'src/data/loot.json';
const SCHEMA_FILE = 'src/data/schema.json';
const OVERRIDES_FILE = 'src/data/uaro-overrides.json';

const errors = [];
const warnings = [];

let items;
try {
  items = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
} catch (err) {
  // Most common cause: a missing or extra comma, or an unclosed quote.
  console.error(`ERROR: ${DATA_FILE} is not valid JSON.\n  ${err.message}`);
  process.exit(1);
}
const schema = JSON.parse(readFileSync(SCHEMA_FILE, 'utf8'));

/** "/12/actions/0" -> "Acorn (actions/0)" so people can find the item. */
const describe = (path) => {
  const [, index, ...rest] = path.split('/');
  const name = items[index]?.name ?? `item #${index}`;
  return rest.length ? `${name} (${rest.join('/')})` : name;
};

// 1. Structure: does every item follow the schema?
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
if (!ajv.validate(schema, items)) {
  for (const e of ajv.errors) {
    const allowed = e.params.allowedValues ? `: ${e.params.allowedValues.join(', ')}` : '';
    errors.push(`${describe(e.instancePath)} ${e.message}${allowed}`);
  }
}

// 2. Duplicates.
const findDuplicates = (key) => {
  const seen = new Map();
  for (const item of items) {
    const value = item[key];
    if (value == null) continue;
    seen.set(value, [...(seen.get(value) ?? []), item.name]);
  }
  return [...seen].filter(([, names]) => names.length > 1);
};
for (const [id, names] of findDuplicates('id')) {
  errors.push(`Duplicate id "${id}": ${names.join(', ')}`);
}
for (const [itemId, names] of findDuplicates('itemId')) {
  warnings.push(`Same itemId ${itemId} used by: ${names.join(', ')}`);
}

// "Used for" targets must be spelled the same everywhere to group together
// in the filter. Catch ones that differ only by capitals, spaces or punctuation.
const targetSpellings = new Map();
for (const item of items) {
  for (const use of item.uses ?? []) {
    const key = use.for.toLowerCase().replace(/[^a-z0-9]/g, '');
    targetSpellings.set(key, new Set([...(targetSpellings.get(key) ?? []), use.for]));
  }
  const targets = (item.uses ?? []).map((use) => use.for);
  const repeated = targets.filter((target, i) => targets.indexOf(target) !== i);
  if (repeated.length) warnings.push(`${item.name} lists the same use twice: ${repeated.join(', ')}`);
}
for (const spellings of targetSpellings.values()) {
  if (spellings.size > 1) warnings.push(`"Used for" spelled different ways: ${[...spellings].join(' / ')}`);
}

// Rules about the game itself.
for (const item of items) {
  if (item.categories?.includes('Card') && item.npcBuyable !== 'no') {
    errors.push(`${item.name}: cards can't be bought from NPCs, so npcBuyable must be "no"`);
  }
  const soldByNpc = item.npcBuyable === 'yes' || item.npcBuyable === 'npc-only';
  if (soldByNpc && item.actions?.some((action) => action === 'Vend' || action === 'Whobuy')) {
    errors.push(`${item.name}: NPCs sell this, so use the "NPC" action instead of "Vend" or "Whobuy"`);
  }
  if (item.actions?.includes('Junk') && item.actions.length > 1) {
    warnings.push(`${item.name}: Junk means "throw it away", so it shouldn't have other actions`);
  }
  if (soldByNpc && (item.avgVend != null || item.avgWhobuy != null)) {
    errors.push(`${item.name}: NPCs sell this, so avgVend and avgWhobuy should be null (the site shows ✕)`);
  }
  // Notes show under "Used For", so keep them about what the item does.
  if (/^dropped by/i.test(item.notes ?? '')) {
    errors.push(`${item.name}: notes shouldn't say who drops it (they show under "Used For")`);
  }
  // A single sentence or fragment ("+4 INT for 20 minutes") has no period.
  // Notes with several sentences keep theirs.
  if (/\.$/.test(item.notes ?? '') && !/\.\s/.test(item.notes)) {
    warnings.push(`${item.name}: notes with one sentence shouldn't end with a period`);
  }
  // Card rules below go by the category, so every card needs it.
  if (/ Card( \(.+\))?$/.test(item.name) && !item.categories?.includes('Card')) {
    warnings.push(`${item.name}: looks like a card, so it should have the "Card" category`);
  }
  if (item.categories?.includes('Card') && item.actions?.includes('NPC')) {
    errors.push(`${item.name}: cards always sell to players, so use "Vend" instead of "NPC"`);
  }
  // Buying stores don't buy cards or equipment (see hasWhobuy in src/utils/prices.js).
  if ((item.itemType === 'Equipment' || item.categories?.includes('Card')) && item.avgWhobuy != null) {
    warnings.push(`${item.name}: @whobuy doesn't buy cards or equipment, so avgWhobuy should be null`);
  }
  if (item.categories?.length > 1 && item.categories.includes('Uncategorized')) {
    warnings.push(`${item.name}: has categories, so "Uncategorized" can be removed`);
  }
}

// uaRO overrides (src/data/uaro-overrides.json) must point at real items.
const overrides = JSON.parse(readFileSync(OVERRIDES_FILE, 'utf8'));
const itemsById = new Map(items.filter((item) => item.itemId != null).map((item) => [item.itemId, item]));
const overriddenIds = new Map(); // itemId -> which list it's in
for (const listName of ['modifiedSellPrices', 'customSellValues', 'notSellableToNpc']) {
  for (const entry of overrides[listName].items) {
    const item = itemsById.get(entry.itemId);
    if (!item) errors.push(`${OVERRIDES_FILE} ${listName}: no item with itemId ${entry.itemId} (${entry.name})`);
    else if (item.name !== entry.name) {
      errors.push(`${OVERRIDES_FILE} ${listName}: itemId ${entry.itemId} is "${item.name}", not "${entry.name}"`);
    }
    if (overriddenIds.has(entry.itemId)) {
      errors.push(`${OVERRIDES_FILE}: ${entry.name} is in both ${overriddenIds.get(entry.itemId)} and ${listName}`);
    }
    overriddenIds.set(entry.itemId, listName);
  }
}
const otherLists = { reviewedPrices: overrides.renewalContent.reviewedPrices };
// Trade and NPC restrictions must agree with the actions.
const notSellableIds = new Set(overrides.notSellableToNpc.items.map((entry) => entry.itemId));
const notTradeableIds = new Set(overrides.tradeRestrictions.notTradeable.items.map((entry) => entry.itemId));
for (const item of items) {
  if (notSellableIds.has(item.itemId) && item.actions?.includes('NPC')) {
    errors.push(`${item.name}: NPCs won't buy it (notSellableToNpc), so it can't have the NPC action`);
  }
  if (notTradeableIds.has(item.itemId)) {
    if (item.actions?.some((action) => action === 'Vend' || action === 'Whobuy')) {
      errors.push(`${item.name}: it can't be traded (notTradeable), so it can't have Vend or Whobuy`);
    }
    if (item.avgVend != null || item.avgWhobuy != null) {
      errors.push(`${item.name}: it can't be traded (notTradeable), so avgVend and avgWhobuy should be null`);
    }
  }
}

// Shop lists don't have to be in loot.json, but if an item is, names must match.
const shopLists = [
  ...overrides.npcShops.uaroShops.shops.map((shop) => [`uaroShops ${shop.name}`, shop.items]),
  ['soldByNpc', overrides.npcShops.soldByNpc.items],
  ['notSoldByNpc', overrides.npcShops.notSoldByNpc.items],
  ['notTradeable', overrides.tradeRestrictions.notTradeable.items],
  ['tradeRestrictions.checked', overrides.tradeRestrictions.checked.items],
];
for (const [listName, entries] of shopLists) {
  for (const entry of entries) {
    const item = itemsById.get(entry.itemId);
    if (item && item.name !== entry.name) {
      errors.push(`${OVERRIDES_FILE} ${listName}: itemId ${entry.itemId} is "${item.name}", not "${entry.name}"`);
    }
  }
}
for (const [listName, list] of Object.entries(otherLists)) {
  for (const entry of list.items) {
    const item = itemsById.get(entry.itemId);
    if (item?.name !== entry.name) {
      errors.push(`${OVERRIDES_FILE} ${listName}: itemId ${entry.itemId} is ${item ? `"${item.name}"` : 'not in loot.json'}, not "${entry.name}"`);
    }
  }
}

// 3. Gentle reminders.
const noSellValue = items.filter((item) => item.sellValue == null && !overriddenIds.has(item.itemId));
if (noSellValue.length) {
  warnings.push(
    `${noSellValue.length} items have no sell price (NPC Sell shows "—"). Add a sellValue, or list them in ${OVERRIDES_FILE}: ${noSellValue.map((item) => item.name).join(', ')}`,
  );
}
const sellsForZero = items.filter((item) => item.sellValue === 0 && !overriddenIds.has(item.itemId));
if (sellsForZero.length) {
  warnings.push(
    `${sellsForZero.length} items sell to NPCs for 0z per the emulators. If NPCs won't buy them, add them to notSellableToNpc; if they have a price, add it to customSellValues: ${sellsForZero.map((item) => item.name).join(', ')}`,
  );
}

const noAction = items.filter((item) => item.actions?.length === 0).map((item) => item.name);
if (noAction.length) warnings.push(`${noAction.length} items have no action yet: ${noAction.join(', ')}`);

const isSorted = items.every((item, i) => i === 0 || items[i - 1].name.localeCompare(item.name) <= 0);
if (!isSorted) warnings.push('Items are not in A-Z order by name. Keeping them sorted makes changes easier to review.');

// Changelog: one entry per day, newest first, with 0.x versions that go up,
// and the newest one matching package.json (the GitHub release uses it).
const packageVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;
const versionParts = (version) => version.split('.').map(Number);
const isNewer = (a, b) => {
  const [x, y] = [versionParts(a), versionParts(b)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};
CHANGELOG.forEach((entry, i) => {
  if (!/^0\.\d+\.\d+$/.test(entry.version ?? '')) {
    errors.push(`Changelog ${entry.date}: version "${entry.version}" should look like 0.3.0 (0.x until the first real release)`);
  }
  const older = CHANGELOG[i + 1];
  if (older && entry.date === older.date) errors.push(`Changelog: two entries for ${entry.date}; merge them into one`);
  if (older && !(entry.date > older.date)) errors.push(`Changelog: ${entry.date} should be newer than ${older.date} below it`);
  if (older && !(isNewer(entry.version, older.version) > 0)) {
    errors.push(`Changelog: version ${entry.version} should be higher than ${older.version} below it`);
  }
});
if (CHANGELOG[0] && CHANGELOG[0].version !== packageVersion) {
  errors.push(`package.json version (${packageVersion}) should match the newest changelog entry (${CHANGELOG[0].version})`);
}

// Report.
warnings.forEach((w) => console.warn(`WARNING: ${w}`));
errors.forEach((e) => console.error(`ERROR: ${e}`));
console.log(`\nChecked ${items.length} items: ${errors.length} errors, ${warnings.length} warnings.`);
process.exit(errors.length ? 1 : 0);
