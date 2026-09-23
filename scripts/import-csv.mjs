/**
 * One-time import: converts the Google Sheet CSV export into src/data/loot.json.
 *
 * Usage:
 *   npm run import:csv                      (uses scripts/source/loot-sheet.csv)
 *   npm run import:csv -- path/to/file.csv  (uses a different export)
 *
 * WARNING: this overwrites src/data/loot.json. Once the site is live,
 * edit loot.json directly instead of re-importing.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import Papa from 'papaparse';
import { RENAMES, DETAIL_FIXES, CATEGORY_FIXES, ITEM_IDS } from './source/sheet-corrections.mjs';

const SOURCE = process.argv[2] ?? 'scripts/source/loot-sheet.csv';
const OUTPUT = 'src/data/loot.json';

// The sheet has two banner rows before the real header row.
const HEADER_ROW = 'Item Name';

/** "a, b, c" -> ["a", "b", "c"] (drops empty parts) */
const splitList = (text) =>
  text.split(',').map((s) => s.trim()).filter(Boolean);

/** "15,500" -> 15500, "" -> null */
const toNumber = (text) => {
  const cleaned = text.replace(/,/g, '').trim();
  return cleaned === '' ? null : Number(cleaned);
};

/** Price columns: in the sheet, 0 means "no data", so treat it like a blank. */
const toPrice = (text) => toNumber(text) || null;

/** "Cap [1]" -> "cap-1", "Alice's Apron" -> "alices-apron" */
const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Sheet's "NPC Buyable" column -> "yes" | "no" | "npc-only" | null */
const toNpcBuyable = (text) => {
  const value = text.trim().toLowerCase();
  if (value.startsWith('yes, npc only')) return 'npc-only';
  if (value === 'yes') return 'yes';
  if (value === 'no') return 'no';
  return null;
};

/** Removes stray trailing commas/spaces, e.g. "x1 for Aliza Pet Evolution," */
const cleanDetails = (text) => {
  let result = text.trim().replace(/[,\s]+$/, '');
  for (const [wrong, right] of Object.entries(DETAIL_FIXES)) result = result.replaceAll(wrong, right);
  return result;
};

const rows = Papa.parse(readFileSync(SOURCE, 'utf8'), { skipEmptyLines: true }).data;
const headerIndex = rows.findIndex((row) => row[0] === HEADER_ROW);
if (headerIndex === -1) throw new Error(`Could not find the "${HEADER_ROW}" header row.`);

const itemsById = new Map();
const merged = [];

for (const row of rows.slice(headerIndex + 1)) {
  const [sheetName, actions, categories, details, itemId, avgVend, avgWhobuy, npcSellPrice, npcBuyable] =
    row.map((cell) => (cell ?? '').trim());
  if (!sheetName) continue;
  const name = RENAMES[sheetName] ?? sheetName;

  const item = {
    id: toSlug(name),
    name,
    itemId: ITEM_IDS[name] ?? toNumber(itemId),
    actions: splitList(actions),
    categories: [...new Set(splitList(categories).map((c) => CATEGORY_FIXES[c] ?? c))],
    details: cleanDetails(details),
    links: [],
    avgVend: toPrice(avgVend),
    avgWhobuy: toPrice(avgWhobuy),
    npcSellPrice: toNumber(npcSellPrice),
    npcBuyable: toNpcBuyable(npcBuyable),
    lastVerified: null,
    verificationNotes: '',
  };

  // The sheet lists a few items twice. Combine them into one entry.
  const existing = itemsById.get(item.id);
  if (existing) {
    mergeInto(existing, item);
    merged.push(name);
  } else {
    itemsById.set(item.id, item);
  }
}

function mergeInto(target, extra) {
  target.actions = [...new Set([...target.actions, ...extra.actions])];
  target.categories = [...new Set([...target.categories, ...extra.categories])];
  target.details = [target.details, extra.details].filter(Boolean).join(', ');
  for (const key of ['itemId', 'avgVend', 'avgWhobuy', 'npcSellPrice', 'npcBuyable']) {
    target[key] ??= extra[key];
  }
}

const items = [...itemsById.values()].sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(OUTPUT, JSON.stringify(items, null, 2) + '\n');

console.log(`Wrote ${items.length} items to ${OUTPUT}`);
if (merged.length) console.log(`Merged duplicate rows: ${merged.join(', ')}`);
console.log('Next: run `npm run validate` to check the result.');
