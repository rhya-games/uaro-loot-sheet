import { describe, expect, it } from 'vitest';
import { isPaletteShortcut, moveHighlight, paletteResults } from './shortcut.js';

describe('isPaletteShortcut', () => {
  it('accepts Cmd+K and Ctrl+K', () => {
    expect(isPaletteShortcut({ key: 'k', metaKey: true })).toBe(true);
    expect(isPaletteShortcut({ key: 'K', ctrlKey: true })).toBe(true);
  });

  it('ignores a plain K and other combinations', () => {
    expect(isPaletteShortcut({ key: 'k' })).toBe(false);
    expect(isPaletteShortcut({ key: 'j', metaKey: true })).toBe(false);
    expect(isPaletteShortcut({ key: 'k', metaKey: true, shiftKey: true })).toBe(false);
    expect(isPaletteShortcut({ key: 'k', ctrlKey: true, altKey: true })).toBe(false);
  });
});

describe('paletteResults', () => {
  const search = (query) => Array.from({ length: 20 }, (_, i) => `${query}${i}`);

  it('shows nothing for an empty query', () => {
    expect(paletteResults(search, '')).toEqual({ results: [], total: 0 });
    expect(paletteResults(search, '   ')).toEqual({ results: [], total: 0 });
  });

  it('cuts the list to the limit and counts every match', () => {
    const { results, total } = paletteResults(search, 'a');
    expect(results).toHaveLength(6);
    expect(total).toBe(20);
    expect(paletteResults(search, 'a', 3).results).toEqual(['a0', 'a1', 'a2']);
  });
});

describe('moveHighlight', () => {
  it('moves down and wraps to the top', () => {
    expect(moveHighlight(-1, 'ArrowDown', 3)).toBe(0);
    expect(moveHighlight(2, 'ArrowDown', 3)).toBe(0);
  });

  it('moves up and wraps to the bottom', () => {
    expect(moveHighlight(1, 'ArrowUp', 3)).toBe(0);
    expect(moveHighlight(0, 'ArrowUp', 3)).toBe(2);
    expect(moveHighlight(-1, 'ArrowUp', 3)).toBe(2);
  });

  it('has nothing to highlight in an empty list', () => {
    expect(moveHighlight(0, 'ArrowDown', 0)).toBe(-1);
  });
});
