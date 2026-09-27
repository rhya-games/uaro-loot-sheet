/**
 * Prints the GitHub release notes for a version as Markdown. The deploy
 * workflow uses it to publish each release, and to fill the run's summary.
 *
 * Two parts (see src/utils/releaseNotes.js):
 *   - the short lines players read on the Changelog page (src/data/changelog.js)
 *   - the notes from every pull request merged since the last release, taken
 *     from the merge commits (the ship-release skill puts the PR description
 *     there), so the long version is in git too
 *
 * "Since the last release" means since the tag of the previous changelog
 * entry. Without that tag, merges after the previous entry's date.
 *
 * Usage: node scripts/release-notes.mjs 0.3.0
 */
import { execFileSync } from 'node:child_process';
import { CHANGELOG } from '../src/data/changelog.js';
import { formatReleaseNotes } from '../src/utils/releaseNotes.js';

const version = process.argv[2];
const index = CHANGELOG.findIndex((candidate) => candidate.version === version);
if (index === -1) {
  console.error(`No changelog entry for version ${version}`);
  process.exit(1);
}
const entry = CHANGELOG[index];
const previous = CHANGELOG[index + 1];

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const hasTag = (tag) => {
  try {
    git('rev-parse', '-q', '--verify', `refs/tags/${tag}`);
    return true;
  } catch {
    return false;
  }
};

/** Merge commits, oldest first, as { subject, body }. */
function mergesSince() {
  const range = previous && hasTag(`v${previous.version}`) ? [`v${previous.version}..HEAD`] : ['HEAD'];
  let log;
  try {
    // Fields: date, subject, body; records end with \x1e.
    log = git('log', '--merges', '--reverse', '--format=%cs%x1f%s%x1f%b%x1e', ...range);
  } catch {
    return []; // not a git checkout (a source archive): just the short notes
  }
  return log
    .split('\x1e')
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => record.split('\x1f'))
    .filter(([date]) => range[0] !== 'HEAD' || !previous || date > previous.date)
    .map(([, subject, body]) => ({ subject, body: body ?? '' }));
}

console.log(formatReleaseNotes(entry, mergesSince()));
