/**
 * The private data: player prices that are NOT kept in the repo.
 *
 * The server's rules don't allow publishing vend prices, so they live in a
 * folder on this computer instead (default ~/.uaro-loot-sheet, or the folder
 * in the UARO_PRIVATE_DIR environment variable):
 *
 *   player-prices.json   { "<item id>": { avgVend, lastVerified, verificationNotes } }
 *                        keyed by the item's id in loot.json
 *   use-targets.json     what "Used For" targets are worth (same shape as
 *                        the old src/data/use-targets.json)
 *   loot-sheet.csv       the original sheet export, for `npm run import:csv`
 *
 * loot.json only keeps `vend`, how the vend price compares with the NPC
 * price (see vendFlag in src/utils/prices.js). `npm run sync:vend` works it
 * out again from the private prices. Without these files (CI, other
 * contributors) everything still works; the checks that need prices are
 * skipped and the stored `vend` values are used as they are.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export const PRIVATE_DIR = resolve(process.env.UARO_PRIVATE_DIR ?? join(homedir(), '.uaro-loot-sheet'));
export const PRICES_FILE = join(PRIVATE_DIR, 'player-prices.json');
export const TARGETS_FILE = join(PRIVATE_DIR, 'use-targets.json');
export const CSV_FILE = join(PRIVATE_DIR, 'loot-sheet.csv');

/** The price fields that live in the private file (and nowhere in the repo). */
export const PRICE_FIELDS = ['avgVend', 'lastVerified', 'verificationNotes'];

/** What an item has when the private file says nothing about it. */
export const NO_PRICE = { avgVend: null, lastVerified: null, verificationNotes: '' };

const TARGETS_ABOUT =
  'What each "Used For" target is worth, for targets that aren\'t loot in the sheet (hats, pet evolutions, quests). The suggester uses these to suggest Keep. Private: kept outside the repo (see scripts/private-data.mjs).';

const readJson = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback);
const writeJson = (file, data) => {
  mkdirSync(PRIVATE_DIR, { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};

/** True when this computer has the private prices. */
export const hasPrivatePrices = () => existsSync(PRICES_FILE);

/** The private prices: { "<item id>": { avgVend, lastVerified, verificationNotes } }. {} when there are none. */
export const readPrices = () => readJson(PRICES_FILE, {});
export const writePrices = (prices) => {
  const sorted = Object.fromEntries(Object.entries(prices).sort(([a], [b]) => a.localeCompare(b)));
  writeJson(PRICES_FILE, sorted);
};

/** The target values: { about, items: [{ for, value }] }. */
export const readTargets = () => readJson(TARGETS_FILE, { about: TARGETS_ABOUT, items: [] });
export const writeTargets = (data) => writeJson(TARGETS_FILE, data);

/** Items with their private prices added (every item gets all three fields). */
export const withPrices = (items, prices = readPrices()) => items.map((item) => ({ ...item, ...NO_PRICE, ...prices[item.id] }));

/** An item without its price fields, as it is stored in loot.json. */
export function withoutPrices(item) {
  const stored = { ...item };
  for (const field of PRICE_FIELDS) delete stored[field];
  return stored;
}
