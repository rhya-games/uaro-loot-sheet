import { priceChanges } from './verify.js';
import { createSuggester } from '../utils/suggest.js';
import { parseZeny } from '../utils/format.js';
import { hasWhobuy, isSoldByNpc, isTradeable } from '../utils/prices.js';

/**
 * Pasting a list of prices into admin mode. One line per item:
 *
 *   <item ID>  <vend price>  <@whobuy price>
 *
 * The columns can be split by spaces, tabs (pasted from a spreadsheet) or
 * semicolons. Prices take the same shorthand as the price boxes ("12,500",
 * "1.5m", "200k"), and 0 or "none" means "checked, and nobody is buying".
 * "-" (or an empty column) leaves that price as it is, and the last column
 * can be left off.
 *
 *   7119  780  580      both prices
 *   1550  1.2m -        vend only
 *   5162  -    0        @whobuy only: nobody is buying
 *
 * Everything here is plain functions, so the tests can use it.
 */

/** The prices' fields, in column order. */
const FIELDS = ['avgVend', 'avgWhobuy'];

/** A column that means "leave this price as it is". */
const isSkipColumn = (text) => text === '' || text === '-' || text === '—';

/**
 * Reads the pasted text into one entry per non-blank line:
 *   { number, raw, itemId, prices }        prices is like { avgVend: 780, avgWhobuy: 0 }
 *   { number, raw, error }                 when the line can't be read
 * `number` is the line's number in the pasted text (blank lines count).
 */
export function parsePriceLines(text) {
  const entries = [];
  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;
    const number = index + 1;
    const fail = (error) => entries.push({ number, raw: line, error });

    // Tabs and semicolons keep empty columns ("7119<tab><tab>580"); spaces just separate.
    const columns = /[\t;]/.test(line) ? line.split(/[\t;]/).map((column) => column.trim()) : line.split(/\s+/);
    const id = columns[0].replace(/^#/, '');
    if (!/^\d+$/.test(id)) return fail(`"${columns[0]}" isn't an item ID`);
    if (columns.length > 1 + FIELDS.length) return fail('Too many columns: expected an item ID, a vend price and an @whobuy price');

    const prices = {};
    for (const [i, field] of FIELDS.entries()) {
      const column = columns[i + 1] ?? '';
      if (isSkipColumn(column)) continue;
      const value = parseZeny(column);
      if (value === undefined) return fail(`Can't read "${column}" as a price`);
      if (value !== null) prices[field] = value;
    }
    if (!Object.keys(prices).length) return fail('No price on this line');
    entries.push({ number, raw: line, itemId: Number(id), prices });
  });
  return entries;
}

/**
 * Works out what each line would do, for the preview and for applying it.
 * Returns one row per line:
 *   { number, raw, status: 'ok', item, prices, changes, notes }
 *       will be saved. `prices` are the ones that apply, `changes` is what
 *       gets saved (prices, date and note; see priceChanges), and `notes` are
 *       warnings ("@whobuy ignored").
 *   { number, raw, status: 'skip', reason, item? }   valid line, but not applied
 *   { number, raw, status: 'error', reason }         the line can't be read
 *
 * Items NPCs sell can't have player prices, and neither can items that can't
 * be traded (validate would fail). Cards and equipment have no @whobuy. An
 * ID that's listed twice uses its first line.
 */
export function planPrices(entries, items, today) {
  const byItemId = new Map();
  for (const item of items) byItemId.set(item.itemId, [...(byItemId.get(item.itemId) ?? []), item]);
  const seen = new Set();

  return entries.map((entry) => {
    const { number, raw } = entry;
    if (entry.error) return { number, raw, status: 'error', reason: entry.error };
    const skip = (reason, item) => ({ number, raw, status: 'skip', reason, item });

    const matches = byItemId.get(entry.itemId) ?? [];
    if (!matches.length) return skip(`No item has ID ${entry.itemId}`);
    if (matches.length > 1) return skip(`${matches.length} items share ID ${entry.itemId}: ${matches.map((m) => m.name).join(', ')}`);
    const [item] = matches;
    if (seen.has(item.id)) return skip('Listed twice: the first line is used', item);
    seen.add(item.id);
    if (isSoldByNpc(item)) return skip('NPCs sell it, so it has no player prices', item);
    if (!isTradeable(item)) return skip("Can't be traded, so it has no player prices", item);

    const prices = { ...entry.prices };
    const notes = [];
    if ('avgWhobuy' in prices && !hasWhobuy(item)) {
      delete prices.avgWhobuy;
      notes.push("@whobuy doesn't apply to cards or equipment, so that price is ignored");
    }
    if (!Object.keys(prices).length) return skip(notes[0], item);
    return { number, raw, status: 'ok', item, prices, changes: priceChanges(item, prices, today), notes };
  });
}

/**
 * The actions each 'ok' row would end up with once every price is in, or
 * null where they stay as they are (saving prices also saves the actions the
 * new prices suggest, like the price boxes do). Returns a Map: item id ->
 * suggested actions. `targets` is the Map of use-targets values.
 */
export function actionsAfter(rows, items, targets) {
  const ready = rows.filter((row) => row.status === 'ok');
  const changes = new Map(ready.map((row) => [row.item.id, row.changes]));
  const next = items.map((item) => (changes.has(item.id) ? { ...item, ...changes.get(item.id) } : item));
  const suggest = createSuggester(next, targets);
  const result = new Map();
  for (const item of next.filter((candidate) => changes.has(candidate.id))) {
    const { actions, sale } = suggest(item);
    const old = items.find((candidate) => candidate.id === item.id).actions;
    const same = actions.length === old.length && actions.every((action) => old.includes(action));
    result.set(item.id, sale && actions.length && !same ? actions : null);
  }
  return result;
}
