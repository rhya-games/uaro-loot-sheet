/**
 * Helpers for reading renewal data from the rAthena emulator
 * (https://github.com/rathena/rathena).
 *
 * uaRO is pre-renewal (Hercules), but it added some renewal content (see
 * src/data/uaro-overrides.json). rAthena's renewal database is more complete
 * than Hercules' for those newer items and monsters, so it's used for:
 *   - prices of renewal items that don't exist in pre-renewal at all
 *   - checking prices of items dropped in uaRO's renewal areas
 */
import { fetchGitHubFile } from './github-files.mjs';

const fetchRathenaFile = (file) => fetchGitHubFile('rathena/rathena', 'master', file);

/**
 * rAthena's databases are YAML files with one entry per "  - Id: ..." block.
 * Returns each block's text, keyed by its Id.
 */
function yamlEntries(text) {
  const entries = new Map();
  for (const chunk of text.split(/\n {2}- Id: /).slice(1)) entries.set(parseInt(chunk, 10), chunk);
  return entries;
}

/** One "    Key: value" field from a YAML entry. */
const yamlField = (entry, key) => entry.match(new RegExp(`\\n {4}${key}: (.*)`))?.[1]?.trim().replace(/^"|"$/g, '');

/**
 * Renewal items: Map item ID -> { id, aegisName, name, sellValue }.
 * sellValue follows the same rule as Hercules: Sell if set, else Buy / 2, else 0.
 */
export async function loadRenewalItemDb() {
  const items = new Map();
  for (const file of ['db/re/item_db_etc.yml', 'db/re/item_db_usable.yml', 'db/re/item_db_equip.yml']) {
    for (const [id, entry] of yamlEntries(await fetchRathenaFile(file))) {
      const buy = yamlField(entry, 'Buy');
      const sell = yamlField(entry, 'Sell');
      items.set(id, {
        id,
        aegisName: yamlField(entry, 'AegisName'),
        name: yamlField(entry, 'Name'),
        sellValue: sell != null ? Number(sell) : buy != null ? Math.floor(Number(buy) / 2) : 0,
      });
    }
  }
  return items;
}

/** Renewal monsters: Map monster ID -> list of item AegisNames it drops. */
export async function loadRenewalMobDrops() {
  const mobs = new Map();
  for (const [id, entry] of yamlEntries(await fetchRathenaFile('db/re/mob_db.yml'))) {
    // Drops look like:  "      - Item: Apple\n        Rate: 5000"
    const drops = [...entry.matchAll(/\n {6}- Item: (\S+)/g)].map((match) => match[1]);
    mobs.set(id, drops);
  }
  return mobs;
}

/**
 * Monster IDs that spawn on the given maps, from an rAthena spawn file.
 * Spawn lines look like:  "spl_fild01,0,0\tmonster\tPinguicula\t1995,40,5000,0,0"
 */
export async function loadSpawnedMobIds(spawnFile, maps) {
  const ids = new Set();
  for (const line of (await fetchRathenaFile(spawnFile)).split('\n')) {
    const [where, kind, , details] = line.split('\t');
    if (!details || !/monster$/.test(kind ?? '')) continue;
    if (maps.includes(where.split(',')[0])) ids.add(parseInt(details, 10));
  }
  return ids;
}
