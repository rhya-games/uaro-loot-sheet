/**
 * Copies the item icons the sheet needs from game-data-tools into
 * public/items/, so the site serves them itself.
 *
 * Each icon is a 24x24 GIF named item<ID>.gif. Every card shares one
 * picture (card.gif): the game gives all cards the same icon. Only icons
 * for items in loot.json are copied, and icons for items no longer in the
 * sheet are removed. Items with no icon are listed.
 *
 * game-data-tools builds the icons (bin/build_item_images.py, and
 * bin/fetch_item_icons.py for missing ones). Find them with --from, the
 * GAME_DATA_TOOLS_ICONS variable, or the default folder below.
 *
 * Usage:
 *   npm run sync:icons                        (copy icons)
 *   npm run sync:icons -- --check             (only report, change nothing)
 *   npm run sync:icons -- --from <folder>     (icons somewhere else)
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const LOOT_FILE = 'src/data/loot.json';
const OUT_DIR = 'public/items';
const CARD_FILE = 'card.gif';
const checkOnly = process.argv.includes('--check');
const fromIndex = process.argv.indexOf('--from');
const sourceDir =
  (fromIndex > 0 && process.argv[fromIndex + 1]) ||
  process.env.GAME_DATA_TOOLS_ICONS ||
  join(homedir(), 'Projects/game-data-tools/images/items');

if (!existsSync(sourceDir)) {
  console.error(`No icon folder at ${sourceDir}. Pass --from <folder>, or build the icons in game-data-tools first.`);
  process.exit(1);
}

const items = JSON.parse(readFileSync(LOOT_FILE, 'utf8'));

// The file each item shows, or null when it has none.
const wanted = new Map();
const missing = [];
for (const item of items) {
  const file = item.categories.includes('Card') ? CARD_FILE : `item${item.itemId}.gif`;
  if (existsSync(join(sourceDir, file))) wanted.set(file, join(sourceDir, file));
  else missing.push(`${item.name} (${item.itemId})`);
}

const existing = existsSync(OUT_DIR) ? readdirSync(OUT_DIR).filter((file) => file.endsWith('.gif')) : [];
const stale = existing.filter((file) => !wanted.has(file));
const toCopy = [...wanted.keys()].filter((file) => !existing.includes(file));

if (!checkOnly) {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const file of toCopy) copyFileSync(wanted.get(file), join(OUT_DIR, file));
  for (const file of stale) unlinkSync(join(OUT_DIR, file));
}

const verb = checkOnly ? 'would copy' : 'copied';
console.log(`${wanted.size} icons used; ${verb} ${toCopy.length} new, ${checkOnly ? 'would remove' : 'removed'} ${stale.length} unused.`);
if (missing.length) console.log(`${missing.length} items have no icon: ${missing.join(', ')}`);
