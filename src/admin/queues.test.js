import { describe, expect, it } from 'vitest';
import { createSuggester } from '../utils/suggest.js';
import { QUEUES, isReviewed, queueCounts, targetsNeedingValue } from './queues.js';

/** A made-up item; itemId 1 isn't in any uaRO override list. */
const item = (fields) => ({
  name: 'Test Item',
  itemId: 1,
  itemType: 'Misc',
  categories: [],
  uses: [],
  actions: [],
  notes: '',
  npcBuyable: 'no',
  sellValue: 100, // NPC pays 124 with Overcharge
  avgVend: null,
  avgWhobuy: null,
  lastVerified: null,
  ...fields,
});

const queue = (id) => QUEUES.find((entry) => entry.id === id);
const names = (rows) => rows.map((row) => row.item.name);
const run = (id, items) => queue(id).select(items, { suggest: createSuggester(items, new Map()) });

describe('needs-price', () => {
  it('lists Vend and Whobuy items with no price, most-used first', () => {
    const items = [
      item({ name: 'A', actions: ['Vend'] }),
      item({ name: 'B', actions: ['Vend'], uses: [{ for: 'X' }, { for: 'Y' }] }),
      item({ name: 'Priced', actions: ['Vend'], avgVend: 500 }),
      item({ name: 'Whobuy only', actions: ['Whobuy'] }),
    ];
    expect(names(run('needs-price', items))).toEqual(['B', 'A', 'Whobuy only']);
  });

  it("skips items NPCs sell, and cards (there's no @whobuy for them)", () => {
    const items = [
      item({ name: 'Shop item', actions: ['Vend'], npcBuyable: 'yes' }),
      item({ name: 'Card', actions: ['Whobuy'], categories: ['Card'] }),
    ];
    expect(run('needs-price', items)).toEqual([]);
  });
});

describe('suggestion-differs', () => {
  it('groups items that share a change, biggest group first', () => {
    const items = [
      item({ name: 'One', actions: ['Vend'], avgVend: 100 }), // NPC is better
      item({ name: 'Two', actions: ['Vend'], avgVend: 100 }),
      item({ name: 'Three', actions: ['NPC'], avgVend: 5000 }), // Vend is better
    ];
    const rows = run('suggestion-differs', items);
    expect(names(rows)).toEqual(['One', 'Two', 'Three']);
    expect(rows[0].reasons).toEqual(['Vend → NPC']);
  });

  it('includes items with no action that now get a suggestion, and skips unsure ones', () => {
    const items = [item({ name: 'New', avgVend: 5000 }), item({ name: 'Unsure' })];
    expect(names(run('suggestion-differs', items))).toEqual(['New']);
  });

  it('carries the suggested actions on each row', () => {
    const rows = run('suggestion-differs', [item({ actions: ['Vend'], avgVend: 100 })]);
    expect(rows[0].suggested).toEqual(['NPC']);
  });

  describe('Keep mine reviews', () => {
    const mine = item({ id: 'mine', name: 'Mine', actions: ['Vend'], avgVend: 100 }); // suggestion: NPC
    const select = (items, reviewed) => queue('suggestion-differs').select(items, { suggest: createSuggester(items, new Map()), reviewed });
    const review = (fields) => new Map([['mine', { id: 'mine', name: 'Mine', actions: ['Vend'], suggested: ['NPC'], ...fields }]]);

    it('hides an item while its actions and its suggestion are what they were', () => {
      expect(select([mine], review())).toEqual([]);
    });

    it('brings it back when the suggestion changes', () => {
      const nowKeep = { ...mine, uses: [{ for: 'Some Quest' }] }; // a quest makes it Keep + NPC
      expect(names(select([nowKeep], review()))).toEqual(['Mine']);
    });

    it('brings it back when the hand-set actions change', () => {
      expect(names(select([{ ...mine, actions: ['Whobuy'] }], review()))).toEqual(['Mine']);
    });

    it('ignores reviews of other items', () => {
      expect(names(select([mine], new Map([['other', { id: 'other', actions: ['Vend'], suggested: ['NPC'] }]])))).toEqual(['Mine']);
    });
  });
});

describe('isReviewed', () => {
  it('needs an entry, and matching actions and suggestion in any order', () => {
    const entry = { actions: ['Keep', 'Vend'], suggested: ['NPC'] };
    expect(isReviewed(entry, { actions: ['Vend', 'Keep'] }, ['NPC'])).toBe(true);
    expect(isReviewed(entry, { actions: ['Vend'] }, ['NPC'])).toBe(false);
    expect(isReviewed(entry, { actions: ['Keep', 'Vend'] }, ['Vend'])).toBe(false);
    expect(isReviewed(undefined, { actions: [] }, [])).toBe(false);
  });
});

describe('unverified-prices', () => {
  it('lists priced items with no lastVerified', () => {
    const items = [
      item({ name: 'Unchecked', avgVend: 500 }),
      item({ name: 'Checked', avgVend: 500, lastVerified: '2026-09-24' }),
      item({ name: 'No price' }),
    ];
    expect(names(run('unverified-prices', items))).toEqual(['Unchecked']);
  });
});

describe('suspicious-values', () => {
  it('flags a vend price below the NPC price', () => {
    const rows = run('suspicious-values', [item({ actions: ['Vend'], avgVend: 50 })]);
    expect(rows[0].reasons).toEqual(['Vend price is below the NPC price']);
  });

  it('does not flag a price of 0 (checked, nobody is buying)', () => {
    expect(run('suspicious-values', [item({ actions: ['Vend'], avgVend: 0 })])).toEqual([]);
  });

  it('flags a price with no matching action', () => {
    const rows = run('suspicious-values', [item({ actions: ['NPC'], avgVend: 5000 })]);
    expect(rows[0].reasons).toEqual(['Has a vend price but no Vend action']);
  });

  it('flags Keep with nothing to keep it for, or with No Use', () => {
    const rows = run('suspicious-values', [item({ actions: ['Keep'], categories: ['No Use'] })]);
    expect(rows[0].reasons).toEqual(['Keep, but nothing uses it', 'Keep, but the category is No Use']);
  });
});

describe('missing-uses and not-reviewed', () => {
  it('lists items with no uses or notes that are not marked No Use', () => {
    const items = [
      item({ name: 'Empty' }),
      item({ name: 'Has notes', notes: 'Drops from X' }),
      item({ name: 'No Use', categories: ['No Use'] }),
      item({ name: 'New', categories: ['Not Reviewed'] }),
    ];
    expect(names(run('missing-uses', items))).toEqual(['Empty']);
    expect(names(run('not-reviewed', items))).toEqual(['New']);
  });
});

describe('queueCounts', () => {
  it('has a count for every queue', () => {
    const items = [item({ actions: ['Vend'] })];
    const counts = queueCounts(items, { suggest: createSuggester(items, new Map()) });
    expect(Object.keys(counts)).toEqual(QUEUES.map((entry) => entry.id));
    expect(counts['needs-price']).toBe(1);
  });
});

describe('targetsNeedingValue', () => {
  it('counts finished things with no value yet, skipping quests and things in the sheet', () => {
    const items = [
      item({ name: 'Part', uses: [{ for: 'Cool Hat' }, { for: 'Checked Hat' }, { for: 'Some Quest' }, { for: 'Other Item' }] }),
      item({ name: 'Other Item' }),
    ];
    expect(targetsNeedingValue(items, new Map([['Checked Hat', 0]]))).toBe(1);
  });
});
