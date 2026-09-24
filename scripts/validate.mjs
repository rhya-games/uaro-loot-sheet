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
  if (soldByNpc && (item.avgVend != null || item.avgWhobuy != null)) {
    errors.push(`${item.name}: NPCs sell this, so avgVend and avgWhobuy should be null (the site shows ✕)`);
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
// Shop lists don't have to be in loot.json, but if an item is, names must match.
const shopLists = [
  ...overrides.npcShops.uaroShops.shops.map((shop) => [`uaroShops ${shop.name}`, shop.items]),
  ['soldByNpc', overrides.npcShops.soldByNpc.items],
  ['notSoldByNpc', overrides.npcShops.notSoldByNpc.items],
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

// Report.
warnings.forEach((w) => console.warn(`WARNING: ${w}`));
errors.forEach((e) => console.error(`ERROR: ${e}`));
console.log(`\nChecked ${items.length} items: ${errors.length} errors, ${warnings.length} warnings.`);
process.exit(errors.length ? 1 : 0);
