import { describe, expect, it } from 'vitest';
import { formatReleaseNotes, parseMerge } from './releaseNotes.js';

const entry = {
  version: '0.4.0',
  date: '2026-10-01',
  title: 'A title',
  changes: [
    { type: 'Fixed', text: 'A fix.' },
    { type: 'Added', text: 'A feature.' },
  ],
};

describe('parseMerge', () => {
  it('takes the title from the body of GitHub’s own merge commits', () => {
    const merge = { subject: 'Merge pull request #11 from owner/admin-queues', body: 'Admin queues\n' };
    expect(parseMerge(merge)).toEqual({ title: '#11 Admin queues', details: '' });
  });

  it('keeps the PR description of a merge made with a custom message', () => {
    const merge = { subject: 'Admin queues (#11)', body: '## Summary\n\nLong notes.\n' };
    expect(parseMerge(merge)).toEqual({ title: 'Admin queues (#11)', details: '## Summary\n\nLong notes.' });
  });
});

describe('formatReleaseNotes', () => {
  it('lists the player-facing lines by type, in the changelog’s order', () => {
    const text = formatReleaseNotes(entry);
    expect(text.startsWith('A title (2026-10-01)')).toBe(true);
    expect(text.indexOf('### Added')).toBeLessThan(text.indexOf('### Fixed'));
    expect(text).not.toMatch(/Merged changes/);
  });

  it('adds the merged pull requests’ notes after the player lines', () => {
    const merges = [{ subject: 'Do a thing (#12)', body: 'Why: because.\n' }];
    const text = formatReleaseNotes(entry, merges);
    expect(text).toMatch(/## Merged changes[\s\S]*#### Do a thing \(#12\)\n\nWhy: because\./);
    expect(text.indexOf('### Fixed')).toBeLessThan(text.indexOf('## Merged changes'));
  });

  it('cuts very long notes short', () => {
    const merges = [{ subject: 'Big (#1)', body: 'x'.repeat(70000) }];
    expect(formatReleaseNotes(entry, merges)).toMatch(/Cut short/);
  });
});
