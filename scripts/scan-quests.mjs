/**
 * Finds which items the emulators' quest scripts ask for, to find "Used For"
 * data that's missing from src/data/loot.json.
 *
 * It reads every NPC script the server loads (like sync:shops does) and lists
 * each item in the sheet that a script takes or checks for:
 *   delitem <item>, <qty>;   the NPC takes it: a real use ("used up")
 *   countitem(<item>)        the NPC only checks that you carry it: the use
 *                            is "not used up" (Sign Quest weapons, for one)
 * Items are written by AegisName or by ID in scripts; both are matched.
 *
 * Items the sheet marks "No Use" are flagged NEW: those are the ones to look
 * at first. Reading the hits and deciding what to add is still a person's job
 * (see the scan-quests skill): the script doesn't know which quests the
 * maintainer wants left out (seal quests, skill quests) or what a script's
 * quantity expression means (it prints the text as written).
 *
 * Usage:
 *   npm run scan:quests                     pre-renewal (Hercules) scripts
 *   npm run scan:quests -- --renewal        renewal (rAthena) scripts
 *   npm run scan:quests -- --path jobs      only script files with "jobs" in the path
 *   npm run scan:quests -- --new            only items the sheet marks No Use
 *   npm run scan:quests -- Talon "Old Card Album"   only these items
 */
import { readFileSync } from 'node:fs';
import { fetchGitHubFile } from './github-files.mjs';
import { loadPreRenewalItemDb } from './hercules.mjs';
import { loadRenewalItemDb } from './rathena.mjs';
import { loadedScriptFiles, stripComments } from './npc-shops.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const renewal = flag('--renewal');
const pathFilter = option('--path');
const onlyNew = flag('--new');
const names = args.filter((arg, i) => !arg.startsWith('--') && args[i - 1] !== '--path');

const loot = JSON.parse(readFileSync('src/data/loot.json', 'utf8'));
const source = renewal
  ? { repo: 'rathena/rathena', branch: 'master', confFile: 'npc/re/scripts_main.conf', db: await loadRenewalItemDb() }
  : { repo: 'HerculesWS/Hercules', branch: 'stable', confFile: 'npc/pre-re/scripts_main.conf', db: await loadPreRenewalItemDb() };

// Every way a script can name an item in the sheet -> the sheet's item.
const lootById = new Map(loot.filter((item) => item.itemId).map((item) => [item.itemId, item]));
const sheetItemFor = new Map();
for (const dbItem of source.db.values()) {
  const item = lootById.get(dbItem.id);
  if (!item) continue;
  sheetItemFor.set(String(dbItem.id), item);
  if (dbItem.aegisName) sheetItemFor.set(dbItem.aegisName, item);
}
const wanted = names.length ? new Set(names.map((name) => name.toLowerCase())) : null;

// Monster spawns and warps hold no quests, so they aren't downloaded.
const files = [...new Set(await loadedScriptFiles(source.repo, source.branch, source.confFile))].filter(
  (file) => !/\/(mobs|warps)\//.test(file) && (!pathFilter || file.includes(pathFilter)),
);

const hits = new Map(); // item id -> [{ kind, qty, npc, file }]
for (let i = 0; i < files.length; i += 8) {
  const batch = files.slice(i, i + 8);
  const texts = await Promise.all(batch.map((file) => fetchGitHubFile(source.repo, source.branch, file).catch(() => '')));
  batch.forEach((file, index) => {
    let npc = '(function)';
    for (const line of stripComments(texts[index]).split('\n')) {
      // "prontera,150,150,4<TAB>script<TAB>Name#id<TAB>sprite,{"
      const header = line.split('\t');
      if (header.length >= 3 && /^(script|function)/.test(header[1])) npc = header[2].split('#')[0].split('::')[0];

      const found = [];
      for (const [, token, qty] of line.matchAll(/delitem\s*\(?\s*([\w-]+)\s*,\s*([^;)]+)/g)) found.push({ kind: 'delitem', token, qty: qty.trim() });
      for (const [, token] of line.matchAll(/countitem\s*\(\s*([\w-]+)\s*\)/g)) found.push({ kind: 'countitem', token, qty: '' });
      for (const { kind, token, qty } of found) {
        const item = sheetItemFor.get(token);
        if (!item) continue;
        if (!hits.has(item)) hits.set(item, []);
        hits.get(item).push({ kind, qty, npc, file });
      }
    }
  });
}

let shown = 0;
for (const [item, list] of [...hits].sort(([a], [b]) => a.name.localeCompare(b.name))) {
  if (wanted && !wanted.has(item.name.toLowerCase())) continue;
  const noUse = item.categories.includes('No Use');
  if (onlyNew && !noUse) continue;
  shown++;
  // The same NPC often checks an item more than once: list each place once.
  const unique = [...new Map(list.map((hit) => [`${hit.kind}|${hit.qty}|${hit.npc}|${hit.file}`, hit])).values()];
  console.log(`\n${item.name} (#${item.itemId})${noUse ? '   NEW: the sheet says No Use' : `   sheet: ${item.uses.length} uses`}`);
  for (const hit of unique) {
    const what = hit.kind === 'delitem' ? `takes ${hit.qty}` : 'only checks';
    console.log(`  ${what.padEnd(16)} ${hit.npc}   (${hit.file.replace(/^npc\//, '')})`);
  }
}
console.log(`\n${shown} items in ${files.length} script files${onlyNew ? ' (only those the sheet marks No Use)' : ''}.`);
