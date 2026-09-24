/**
 * Downloads files from public GitHub repos (the emulators we read data from),
 * caching them in scripts/.cache/ (not committed) so each file downloads once.
 * Delete that folder to download fresh copies.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const CACHE_DIR = 'scripts/.cache';

/**
 * @param repo   e.g. "HerculesWS/Hercules"
 * @param branch e.g. "stable"
 * @param file   path inside the repo, e.g. "db/pre-re/item_db.conf"
 */
export async function fetchGitHubFile(repo, branch, file) {
  const cachePath = path.join(CACHE_DIR, `${repo}/${branch}/${file}`.replaceAll('/', '__'));
  if (existsSync(cachePath)) return readFileSync(cachePath, 'utf8');

  console.log(`Downloading ${file} from ${repo}...`);
  const response = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/${file}`);
  if (!response.ok) throw new Error(`Could not download ${file} from ${repo} (HTTP ${response.status})`);
  const text = await response.text();
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cachePath, text);
  return text;
}
