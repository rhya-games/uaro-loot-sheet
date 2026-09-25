/**
 * Prints the GitHub release notes for a version, from src/data/changelog.js,
 * as Markdown. The deploy workflow uses it to publish each release.
 *
 * Usage: node scripts/release-notes.mjs 0.2.0
 */
import { CHANGELOG, CHANGE_TYPES } from '../src/data/changelog.js';

const version = process.argv[2];
const entry = CHANGELOG.find((candidate) => candidate.version === version);
if (!entry) {
  console.error(`No changelog entry for version ${version}`);
  process.exit(1);
}

const sections = CHANGE_TYPES.map((type) => {
  const changes = entry.changes.filter((change) => change.type === type);
  return changes.length ? `### ${type}\n\n${changes.map((change) => `- ${change.text}`).join('\n')}` : null;
}).filter(Boolean);

console.log(`${entry.title} (${entry.date})\n\n${sections.join('\n\n')}`);
