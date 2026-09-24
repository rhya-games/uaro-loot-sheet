/**
 * Helpers for reading data from the Hercules emulator
 * (https://github.com/HerculesWS/Hercules).
 *
 * uaRO is a pre-renewal server, so pre-renewal files are used first.
 * Some newer items only exist in the renewal files, so those are used
 * as a fallback.
 *
 * Files are downloaded once and cached in scripts/.cache/ (not committed).
 * Delete that folder to download fresh copies.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const BRANCH = 'stable';
const BASE_URL = `https://raw.githubusercontent.com/HerculesWS/Hercules/${BRANCH}/`;
const CACHE_DIR = 'scripts/.cache';

/** Downloads a file from the Hercules repo (or reads the cached copy). */
export async function fetchHerculesFile(repoPath) {
  const cachePath = path.join(CACHE_DIR, repoPath.replaceAll('/', '__'));
  if (existsSync(cachePath)) return readFileSync(cachePath, 'utf8');

  console.log(`Downloading ${repoPath} from Hercules...`);
  const response = await fetch(BASE_URL + repoPath);
  if (!response.ok) throw new Error(`Could not download ${repoPath} (HTTP ${response.status})`);
  const text = await response.text();
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cachePath, text);
  return text;
}

/**
 * Reads the fields we need from a Hercules item_db.conf file.
 * Returns a Map: item ID -> { id, aegisName, name, type, slots, sellValue }.
 *
 * Each entry in the file looks like:
 *   {
 *     Id: 501
 *     AegisName: "Red_Potion"
 *     Name: "Red Potion"
 *     Type: "IT_HEALING"
 *     Buy: 50
 *     ...
 *   },
 */
export function parseItemDb(text) {
  const items = new Map();
  const entryPattern = /\{\s*Id:\s*(\d+)(.*?)\n\}/gs;
  const field = (body, name) => body.match(new RegExp(`\\n\\s*${name}:\\s*"?([^"\\n]*)"?`))?.[1];

  for (const [, id, body] of text.matchAll(entryPattern)) {
    items.set(Number(id), {
      id: Number(id),
      aegisName: field(body, 'AegisName'),
      name: field(body, 'Name'),
      type: field(body, 'Type') ?? 'IT_ETC', // Hercules' default when Type is left out.
      slots: Number(field(body, 'Slots') ?? 0),
      sellValue: sellValue(field(body, 'Buy'), field(body, 'Sell')),
    });
  }
  return items;
}

/**
 * Zeny an NPC pays for one of the item, before any skills. Same rules as
 * Hercules (src/map/itemdb.cpp, itemdb_validate_entry):
 *   - "Sell" is used if it's set,
 *   - otherwise half of "Buy" (rounded down),
 *   - neither set: 0.
 */
function sellValue(buyText, sellText) {
  const buy = buyText == null ? null : Number(buyText);
  const sell = sellText == null ? null : Number(sellText);
  if (sell != null) return sell;
  if (buy != null) return Math.floor(buy / 2);
  return 0;
}

/**
 * The Overcharge bonus (%) at a given skill level, read from Hercules' own
 * code (src/map/pc.cpp, pc_modifysellvalue):
 *
 *   rate = 5 + skill_lv * 2 - ((skill_lv == 10) ? 1 : 0);
 *
 * If Hercules ever changes that line, this stops with an error instead of
 * quietly using an outdated number.
 */
export async function loadOverchargePercent(level) {
  const source = await fetchHerculesFile('src/map/pc.cpp');
  const match = source.match(
    /rate\s*=\s*(\d+)\s*\+\s*skill_lv\s*\*\s*(\d+)\s*-\s*\(\(skill_lv\s*==\s*(\d+)\)\s*\?\s*(\d+)\s*:\s*0\)/,
  );
  if (!match) {
    throw new Error('Could not find the Overcharge formula in src/map/pc.cpp. Check pc_modifysellvalue in Hercules.');
  }
  const [, base, perLevel, specialLevel, specialPenalty] = match.map(Number);
  return base + level * perLevel - (level === specialLevel ? specialPenalty : 0);
}

/** All items: pre-renewal entries, plus renewal-only entries as a fallback. */
export async function loadItemDb() {
  const preRenewal = parseItemDb(await fetchHerculesFile('db/pre-re/item_db.conf'));
  const renewal = parseItemDb(await fetchHerculesFile('db/re/item_db.conf'));
  for (const [id, item] of renewal) if (!preRenewal.has(id)) preRenewal.set(id, item);
  return preRenewal;
}
