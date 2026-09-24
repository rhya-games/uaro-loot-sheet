/**
 * One-time import: converts the Google Sheet CSV export into src/data/loot.json.
 *
 * Usage:
 *   npm run import:csv                      (uses scripts/source/loot-sheet.csv)
 *   npm run import:csv -- path/to/file.csv  (uses a different export)
 *
 * Needs an internet connection the first time, to download item types
 * from the Hercules emulator (see scripts/hercules.mjs).
 *
 * WARNING: this overwrites src/data/loot.json. Once the site is live,
 * edit loot.json directly instead of re-importing.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import Papa from 'papaparse';
import { loadItemDb } from './hercules.mjs';
import {
  RENAMES,
  DETAIL_FIXES,
  ACTION_FIXES,
  USE_TARGET_FIXES,
  CATEGORY_FIXES,
  REFINING_ONLY,
  ITEM_IDS,
} from './source/sheet-corrections.mjs';

const SOURCE = process.argv[2] ?? 'scripts/source/loot-sheet.csv';
const OUTPUT = 'src/data/loot.json';

// The sheet has two banner rows before the real header row.
const HEADER_ROW = 'Item Name';

/** Hercules item type -> our itemType. Anything not listed is "Misc". */
const HERCULES_ITEM_TYPES = {
  IT_HEALING: 'Consumable',
  IT_USABLE: 'Consumable',
  IT_DELAYCONSUME: 'Consumable',
  IT_CASH: 'Consumable',
  IT_WEAPON: 'Equipment',
  IT_ARMOR: 'Equipment',
  IT_AMMO: 'Equipment',
};

/** Sheet categories that meant an item type, for items Hercules doesn't have. */
const SHEET_ITEM_TYPES = {
  Consumable: 'Consumable',
  'Valuable Consumable': 'Consumable',
  Equipment: 'Equipment',
  Gear: 'Equipment',
};

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

/**
 * Splits the sheet's Details text into structured uses and leftover notes.
 *
 *   "x10 for Mystic Rose, Isis Taming Item, xVaries for Sign Quest"
 *   -> uses:  [{ for: "Mystic Rose", qty: 10 }, { for: "Sign Quest", qty: null }]
 *      notes: "Isis Taming Item"
 */
function parseDetails(text) {
  let cleaned = text;
  for (const [wrong, right] of Object.entries(DETAIL_FIXES)) cleaned = cleaned.replaceAll(wrong, right);
  // "x10,000" -> "x10000", so the comma isn't mistaken for a separator.
  cleaned = cleaned.replace(/x(\d{1,3}(?:,\s?\d{3})+)\b/g, (_, digits) => `x${digits.replace(/,\s?/g, '')}`);

  const uses = [];
  const notes = [];
  for (const part of splitList(cleaned)) {
    const match = part.match(/^x(\d+|varies)\s+for\s+(.+)$/i);
    if (match) {
      const qty = /^\d+$/.test(match[1]) ? Number(match[1]) : null;
      const target = match[2].trim();
      const fix = USE_TARGET_FIXES[target] ?? target;
      const use = typeof fix === 'string' ? { for: fix, qty } : { for: fix.for, qty, note: fix.note };
      if (!uses.some((existing) => existing.for === use.for)) uses.push(use);
    } else if (part !== '-') {
      notes.push(part);
    }
  }
  return { uses, notes: notes.join(', ') };
}

/** Applies CATEGORY_FIXES: renames, merges and removals. No categories left -> "Uncategorized". */
function fixCategories(name, categories) {
  const fixed = categories.flatMap((category) => {
    if (category === 'Refining / Ore / Forging' && REFINING_ONLY.includes(name)) return [];
    return CATEGORY_FIXES[category] ?? [category];
  });
  return fixed.length ? [...new Set(fixed)] : ['Uncategorized'];
}

/**
 * Applies ACTION_FIXES, then: if an NPC sells the item, players won't pay
 * more than the NPC price, so Vend/Whobuy become NPC.
 */
function fixActions(actions, npcBuyable) {
  let fixed = splitList(actions).map((action) => ACTION_FIXES[action] ?? action);
  if (npcBuyable === 'yes' || npcBuyable === 'npc-only') {
    fixed = fixed.map((action) => (action === 'Vend' || action === 'Whobuy' ? 'NPC' : action));
  }
  return [...new Set(fixed)];
}

/** Item type from Hercules, or from the sheet's categories if Hercules doesn't have the item. */
function getItemType(itemId, sheetCategories, itemDb) {
  const herculesItem = itemDb.get(itemId);
  if (herculesItem) return HERCULES_ITEM_TYPES[herculesItem.type] ?? 'Misc';
  for (const category of sheetCategories) {
    if (SHEET_ITEM_TYPES[category]) return SHEET_ITEM_TYPES[category];
  }
  return 'Misc';
}

const itemDb = await loadItemDb();
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
  const sheetCategories = splitList(categories);
  const finalItemId = ITEM_IDS[name] ?? toNumber(itemId);
  const finalCategories = fixCategories(name, sheetCategories);
  // NPCs never sell cards.
  const finalNpcBuyable = finalCategories.includes('Card') ? 'no' : toNpcBuyable(npcBuyable);

  const item = {
    id: toSlug(name),
    name,
    itemId: finalItemId,
    itemType: getItemType(finalItemId, sheetCategories, itemDb),
    actions: fixActions(actions, finalNpcBuyable),
    categories: finalCategories,
    ...parseDetails(details),
    links: [],
    avgVend: toPrice(avgVend),
    avgWhobuy: toPrice(avgWhobuy),
    npcSellPrice: toNumber(npcSellPrice),
    npcBuyable: finalNpcBuyable,
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
  if (target.categories.length > 1) target.categories = target.categories.filter((c) => c !== 'Uncategorized');
  target.uses = [...target.uses, ...extra.uses];
  target.notes = [target.notes, extra.notes].filter(Boolean).join(', ');
  for (const key of ['itemId', 'avgVend', 'avgWhobuy', 'npcSellPrice', 'npcBuyable']) {
    target[key] ??= extra[key];
  }
}

const items = [...itemsById.values()].sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(OUTPUT, JSON.stringify(items, null, 2) + '\n');

console.log(`Wrote ${items.length} items to ${OUTPUT}`);
if (merged.length) console.log(`Merged duplicate rows: ${merged.join(', ')}`);
console.log('Next: run `npm run validate` to check the result.');
