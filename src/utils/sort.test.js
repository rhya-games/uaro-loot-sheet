import { describe, expect, it } from 'vitest';
import { SORT_VALUES, sortItems } from './sort.js';

const item = (name, fields = {}) => ({
  name,
  itemId: 1,
  itemType: 'Misc',
  categories: [],
  uses: [],
  actions: [],
  npcBuyable: 'no',
  sellValue: 10,
  avgVend: null,
  lastVerified: null,
  ...fields,
});

describe('sorting', () => {
  // Sorting by a column once crashed the page (a missing import).
  it('can sort by every column', () => {
    const items = [item('A', { avgVend: 5 }), item('B', { avgVend: 9 })];
    for (const key of Object.keys(SORT_VALUES)) {
      expect(() => sortItems(items, { key, direction: 'asc' })).not.toThrow();
    }
  });

  it('puts items without a value last, both ways', () => {
    const items = [item('None'), item('Cheap', { avgVend: 5 }), item('Dear', { avgVend: 50 })];
    expect(sortItems(items, { key: 'avgVend', direction: 'asc' }).map((i) => i.name)).toEqual(['Cheap', 'Dear', 'None']);
    expect(sortItems(items, { key: 'avgVend', direction: 'desc' }).map((i) => i.name)).toEqual(['Dear', 'Cheap', 'None']);
  });

  it('has no Whobuy column any more', () => {
    expect(SORT_VALUES).not.toHaveProperty('avgWhobuy');
  });
});
