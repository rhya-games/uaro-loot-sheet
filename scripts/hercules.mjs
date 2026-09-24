/**
 * Helpers for reading data from the Hercules emulator
 * (https://github.com/HerculesWS/Hercules).
 *
 * uaRO is a pre-renewal server, so Hercules' pre-renewal data is the main
 * source. (Renewal content uaRO added is read from rAthena, see rathena.mjs.)
 */
import { fetchGitHubFile } from './github-files.mjs';

/** Downloads a file from the Hercules repo ("stable" branch), cached. */
export function fetchHerculesFile(repoPath) {
  return fetchGitHubFile('HerculesWS/Hercules', 'stable', repoPath);
}

/**
 * Reads the fields we need from a Hercules item_db.conf file.
 * Returns a Map: item ID -> { id, aegisName, name, type, slots, sellValue, hasPrice }.
 * hasPrice is false when the entry sets neither Buy nor Sell (Hercules then
 * treats it as 0z, but usually it just means nobody filled the price in).
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
      hasPrice: field(body, 'Buy') != null || field(body, 'Sell') != null,
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

/** Pre-renewal items only: Map item ID -> { id, aegisName, name, type, slots, sellValue }. */
export async function loadPreRenewalItemDb() {
  return parseItemDb(await fetchHerculesFile('db/pre-re/item_db.conf'));
}

/** All items: pre-renewal entries, plus renewal-only entries as a fallback. */
export async function loadItemDb() {
  const preRenewal = parseItemDb(await fetchHerculesFile('db/pre-re/item_db.conf'));
  const renewal = parseItemDb(await fetchHerculesFile('db/re/item_db.conf'));
  for (const [id, item] of renewal) if (!preRenewal.has(id)) preRenewal.set(id, item);
  return preRenewal;
}
