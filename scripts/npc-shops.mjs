/**
 * Reads which items NPC shops sell, from the emulators' NPC scripts.
 *
 * The scripts a server actually loads are listed in a starting .conf file
 * (Hercules pre-renewal: npc/pre-re/scripts_main.conf; rAthena renewal:
 * npc/re/scripts_main.conf) and the .conf files it includes. Commented-out
 * lines ("//") aren't loaded, so they're skipped.
 *
 * Shops come in two forms:
 *   - one line:  "alberta,...<TAB>shop<TAB>Tool Dealer#alb<TAB>4_M_01,Red_Potion:-1,..."
 *     ("-1" means the item's normal Buy price.) The shop type (shop,
 *     cashshop, ...) says what you pay with.
 *   - a "trader" NPC with lines like "sellitem Red_Potion;" and optionally
 *     "tradertype(NST_MARKET);" to say what you pay with.
 *
 * Items are listed by AegisName (Red_Potion) or item ID (501).
 */
import { fetchGitHubFile } from './github-files.mjs';

/** What you pay with, per shop type. Only "zeny" means you can just buy it. */
const SHOP_CURRENCY = {
  shop: 'zeny',
  cashshop: 'cash points',
  pointshop: 'points',
  itemshop: 'items',
  marketshop: 'zeny', // limited stock, but zeny
};
const TRADER_CURRENCY = {
  NST_ZENY: 'zeny',
  NST_MARKET: 'zeny',
  NST_CASH: 'cash points',
  NST_CUSTOM: 'items or points',
  NST_BARTER: 'items',
};

/**
 * Script files a server loads, following includes from a starting .conf.
 *   Hercules:  @include "npc/scripts.conf"   and   "npc/merchants/shops.txt",
 *   rAthena:   import: npc/scripts_athena.conf   and   npc: npc/merchants/shops.txt
 */
async function loadedScriptFiles(repo, branch, confFile, seen = new Set()) {
  const files = [];
  if (seen.has(confFile)) return files;
  seen.add(confFile);
  const text = await fetchGitHubFile(repo, branch, confFile);
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\/\/.*$/, '').trim();
    const include = line.match(/^(?:@include\s+"([^"]+)"|import:\s*(\S+\.conf))/);
    const script = line.match(/^npc:\s*(\S+\.txt)/)?.[1];
    if (include) files.push(...(await loadedScriptFiles(repo, branch, include[1] ?? include[2], seen)));
    else if (script) files.push(script);
    else files.push(...[...line.matchAll(/"(npc\/[^"]+\.txt)"/g)].map((match) => match[1]));
  }
  return files;
}

/** Removes /* ... *\/ and // comments from a script. */
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

/**
 * Parses shops out of one NPC script file.
 * Returns [{ item (AegisName or ID text), shop, map, currency }].
 */
function parseShops(text, file) {
  const found = [];
  const lines = stripComments(text).split('\n');
  for (let i = 0; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    if (columns.length < 4) continue;
    const [where, type, name, rest] = columns;
    const map = where.split(',')[0];
    const shopName = name.split('#')[0].split('::')[0];

    if (SHOP_CURRENCY[type]) {
      // Everything after the sprite: "Red_Potion:-1,Orange_Potion:-1".
      // Item and point shops name their currency first: "sprite,Poring_Coin,..."
      const firstItem = type === 'itemshop' || type === 'pointshop' ? 2 : 1;
      for (const entry of rest.split(',').slice(firstItem)) {
        const item = entry.split(':')[0].trim();
        if (item) found.push({ item, shop: shopName, map, currency: SHOP_CURRENCY[type], file });
      }
    } else if (type === 'trader') {
      // Read the block until the NPC's closing "}" at the start of a line.
      let currency = 'zeny';
      const items = [];
      for (let j = i + 1; j < lines.length && !/^}/.test(lines[j]); j++) {
        const traderType = lines[j].match(/tradertype\s*\(\s*(NST_\w+)/)?.[1];
        if (traderType) currency = TRADER_CURRENCY[traderType] ?? traderType;
        const sold = lines[j].match(/sellitem\s+([\w-]+)/)?.[1];
        if (sold) items.push(sold);
      }
      for (const item of items) found.push({ item, shop: shopName, map, currency, file });
    }
  }
  return found;
}

/**
 * Everything the loaded NPC shops sell.
 * Returns Map: item ID -> list of { shop, map, currency, file }.
 * `itemDb` (Map id -> { aegisName }) is used to turn AegisNames into IDs.
 */
export async function loadShopItems({ repo, branch, confFile, itemDb, onlyFiles }) {
  const idByAegis = new Map([...itemDb.values()].map((entry) => [entry.aegisName, entry.id]));
  let files = [...new Set(await loadedScriptFiles(repo, branch, confFile))];
  if (onlyFiles) files = files.filter(onlyFiles);

  const shopItems = new Map();
  const texts = await inBatches(files, 8, (file) => fetchGitHubFile(repo, branch, file).catch(() => ''));
  files.forEach((file, index) => {
    for (const entry of parseShops(texts[index], file)) {
      const id = /^\d+$/.test(entry.item) ? Number(entry.item) : idByAegis.get(entry.item);
      if (id == null) continue;
      if (!shopItems.has(id)) shopItems.set(id, []);
      shopItems.get(id).push({ shop: entry.shop, map: entry.map, currency: entry.currency, file: entry.file });
    }
  });
  return shopItems;
}

/** Runs `task` over `list`, a few at a time (to be kind to GitHub). */
async function inBatches(list, size, task) {
  const results = [];
  for (let i = 0; i < list.length; i += size) results.push(...(await Promise.all(list.slice(i, i + size).map(task))));
  return results;
}
