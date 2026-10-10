import { CHANGE_TYPES } from '../data/changelog.js';

/** GitHub allows 125,000 characters in release notes; stay well under. */
const MAX_DETAILS_LENGTH = 60000;

/**
 * One merge commit -> { title, details }. GitHub's own merge commits read
 * "Merge pull request #11 from owner/branch" with the PR title as the body,
 * so the title comes from there. Merges made with the ship-release skill
 * have the PR title as the subject and the PR description as the body.
 */
export function parseMerge({ subject, body }) {
  const lines = body.trim().split('\n');
  if (/^Merge pull request #\d+ from /.test(subject)) {
    const number = subject.match(/#(\d+)/)[1];
    return { title: `#${number} ${lines[0]}`, details: lines.slice(1).join('\n').trim() };
  }
  return { title: subject, details: body.trim() };
}

/**
 * The GitHub release notes for one changelog entry, as Markdown: the lines
 * players read on the site, then the notes from the pull requests merged
 * since the last release (the long version, for maintainers and agents).
 *
 * `merges` is a list of { subject, body } merge commits, oldest first.
 */
export function formatReleaseNotes(entry, merges = []) {
  const sections = CHANGE_TYPES.map((type) => {
    const changes = entry.changes.filter((change) => change.type === type);
    return changes.length ? `### ${type}\n\n${changes.map((change) => `- ${change.text}`).join('\n')}` : null;
  }).filter(Boolean);

  let text = `${entry.title} (${entry.date})\n\n${sections.join('\n\n')}`;
  if (merges.length) {
    let details = merges
      .map(parseMerge)
      .map(({ title, details: body }) => `#### ${title}${body ? `\n\n${body}` : ''}`)
      .join('\n\n');
    if (details.length > MAX_DETAILS_LENGTH) details = `${details.slice(0, MAX_DETAILS_LENGTH)}\n\n(Cut short. See the pull requests.)`;
    text += `\n\n## Merged changes\n\nThe notes from each pull request in this release, for maintainers and agents.\n\n${details}`;
  }
  return text;
}
