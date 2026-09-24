/**
 * Builds research/uaro-monsters.json from research/uaro-monsters-transcribed.mjs,
 * filling in each drop's item ID.
 *
 * Item names from the game are matched, in order, against:
 *   1. the monster's drops in rAthena's renewal monster database
 *   2. items in src/data/loot.json
 *   3. rAthena's renewal item database
 * Slots ("[1]") are ignored when matching names. Anything that doesn't match
 * is printed so it can be fixed by hand (ITEM_IDS below).
 *
 * Usage: node research/build-monsters.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { MONSTERS, SOURCE } from './uaro-monsters-transcribed.mjs';
import { loadRenewalItemDb } from '../scripts/rathena.mjs';
import { fetchGitHubFile } from '../scripts/github-files.mjs';

/** Names that can't be matched automatically: "name as shown in game" -> item ID. */
const ITEM_IDS = {
  "Piece of Queen's Wing": 6326, // rAthena: Queen Wing Piece
  'Meteor Plate [1]': 2364, // rAthena: Meteo Plate Armor
  'Chrome Metal Two-Handed Sword': 1196, // rAthena: Chrome Two-Handed Sword
  'Twin Horn Helm': 6323, // rAthena: Two-Horned Helmet
  'Antler Helm': 6322, // rAthena: Antler Helmet
  'Single Horn Helm': 6324, // rAthena: Single Horned Helmet
  'Forbidden Grimoire [1]': 28628, // the book (28984 is a special variant)
  'Horn of Hillslion [3]': 1825, // the knuckle weapon (6032 is the misc item)
  'Hillslion Card': 4453, // rAthena: Hillsrion Card
  'Horn of Hillslion': 6032, // the misc item (1825 is the knuckle weapon)
  'Small Water Bottle': 12353, // rAthena: Small Bottle
};

const simplify = (name) => name.toLowerCase().replace(/\[\d\]/g, '').replace(/[^a-z0-9]/g, '');
const loot = JSON.parse(readFileSync('src/data/loot.json', 'utf8'));
const renewal = await loadRenewalItemDb();
const byAegis = new Map([...renewal.values()].map((item) => [item.aegisName, item]));

// rAthena renewal drops per monster: "  - Item: Apple".
const mobDb = await fetchGitHubFile('rathena/rathena', 'master', 'db/re/mob_db.yml');
const dropsByMob = new Map();
for (const chunk of mobDb.split(/\n {2}- Id: /).slice(1)) {
  const id = parseInt(chunk, 10);
  dropsByMob.set(id, [...chunk.matchAll(/\n {6}- Item: (\S+)/g)].map((m) => byAegis.get(m[1])).filter(Boolean));
}

const unmatched = [];
function resolve(monsterId, name) {
  if (ITEM_IDS[name]) return ITEM_IDS[name];
  const key = simplify(name);
  const slots = name.match(/\[(\d)\]/)?.[1];
  const fromMob = (dropsByMob.get(monsterId) ?? []).filter((item) => simplify(item.name) === key);
  if (fromMob.length === 1) return fromMob[0].id;
  const fromSheet = loot.filter((item) => simplify(item.name) === key && (!slots || item.name.includes(`[${slots}]`)));
  if (fromSheet.length === 1) return fromSheet[0].itemId;
  const fromDb = [...renewal.values()].filter((item) => simplify(item.name) === key);
  if (fromDb.length === 1) return fromDb[0].id;
  unmatched.push(`${name} (${MONSTERS.find((m) => m.id === monsterId).name}): ${fromMob.length + fromSheet.length + fromDb.length} candidates`);
  return null;
}

const monsters = MONSTERS.map((monster) => ({
  ...monster,
  drops: monster.drops.map(([item, chance]) => ({ item, itemId: resolve(monster.id, item), chance })),
}));
writeFileSync('research/uaro-monsters.json', JSON.stringify({ source: SOURCE, monsters }, null, 2) + '\n');
console.log(`Wrote research/uaro-monsters.json (${monsters.length} monsters).`);
if (unmatched.length) console.log(`Unmatched (add to ITEM_IDS):\n  ${unmatched.join('\n  ')}`);
