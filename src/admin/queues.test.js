import { describe, expect, it } from 'vitest';
import { createSuggester } from '../utils/suggest.js';
import { QUEUES, canHavePrice, isReviewed, pricePriority, targetPriority, queueCounts, targetsNeedingValue } from './queues.js';

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
  lastVerified: null,
  ...fields,
});

const queue = (id) => QUEUES.find((entry) => entry.id === id);
const names = (rows) => rows.map((row) => row.item.name);
const run = (id, items) => queue(id).select(items, { suggest: createSuggester(items, new Map()) });

describe('needs-price', () => {
  it('lists Vend items with no price, most-used first', () => {
    const items = [
      item({ name: 'A', actions: ['Vend'] }),
      item({ name: 'B', actions: ['Vend'], uses: [{ for: 'X' }, { for: 'Y' }] }),
      item({ name: 'Priced', actions: ['Vend'], avgVend: 500 }),
      item({ name: 'NPC only', actions: ['NPC'] }),
    ];
    expect(names(run('needs-price', items))).toEqual(['B', 'A']);
  });

  it('lists items with no action yet, so they can get a price (and then an action)', () => {
    const items = [
      item({ name: 'Unsure' }),
      item({ name: 'Equipment', itemType: 'Equipment' }),
      item({ name: 'Shop item', npcBuyable: 'yes' }),
      item({ name: 'Priced', avgVend: 500 }),
    ];
    expect(names(run('needs-price', items))).toEqual(['Equipment', 'Unsure']);
    expect(run('needs-price', items)[0].reasons).toEqual(['No action yet, no vend price']);
  });

  it('skips items NPCs sell', () => {
    const items = [item({ name: 'Shop item', actions: ['Vend'], npcBuyable: 'yes' })];
    expect(run('needs-price', items)).toEqual([]);
  });
});

describe('needs-price, priority by quest relevance', () => {
  it('orders server hat quests, other quests, the rest, then official hat quests', () => {
    const queued = (name, categories, uses = 1) =>
      item({ name, actions: ['Vend'], categories, uses: Array.from({ length: uses }, (_, index) => ({ for: `T${index}` })) });
    const items = [
      queued('Official only', ['Official Hat Quest'], 9),
      queued('Cooking', ['Cooking'], 5),
      queued('Pet evolution', ['Pet Evolution', 'Pet', 'uaRO'], 2),
      queued('Server hat', ['Server Hat Quest', 'uaRO'], 1),
      queued('Official and cooking', ['Official Hat Quest', 'Cooking'], 3),
      queued('Official and quest', ['Official Hat Quest', 'Other Quest'], 1),
    ];
    expect(names(run('needs-price', items))).toEqual([
      'Server hat',
      'Pet evolution', // quests: 2 uses
      'Official and quest', // best tier of its categories: quests, 1 use
      'Cooking', // default tier: 5 uses
      'Official and cooking', // best of official (low) and cooking (default): 3 uses
      'Official only',
    ]);
  });

  it('puts items with no categories in the default tier', () => {
    expect(pricePriority(item({ categories: [] }))).toBe(2);
    expect(pricePriority(item({ categories: ['No Use'] }))).toBe(3);
  });
});

describe('targetPriority', () => {
  const part = (...categories) => item({ categories });

  it('treats "<pet> Pet Evolution" as a pet evolution whatever its parts are', () => {
    expect(targetPriority('Smokie Pet Evolution', [part('Server Hat Quest')])).toBe(1);
  });

  it('goes by the most common quest category among the parts, not the best one', () => {
    // A weapon quest whose parts are mostly Other Quest, with one also used for a server hat.
    const weapon = [part('Other Quest'), part('Other Quest'), part('Other Quest', 'Server Hat Quest')];
    expect(targetPriority('Great Axe', weapon)).toBe(1);
    expect(targetPriority('Beer Hat', [part('Server Hat Quest'), part('Server Hat Quest', 'Pet Evolution')])).toBe(0);
  });

  it('breaks a tie toward the better tier, and ignores parts with no quest category', () => {
    expect(targetPriority('Hat', [part('Server Hat Quest'), part('Official Hat Quest'), part('Cooking')])).toBe(0);
    expect(targetPriority('Food', [part('Cooking'), part('Official Hat Quest', 'Cooking')])).toBe(3);
  });

  it('uses the hand-set tier for targets the parts cannot place', () => {
    const both = part('Server Hat Quest', 'Official Hat Quest');
    expect(targetPriority('Bunny Band', [both])).toBe(3);
    expect(targetPriority('Kitsune Mask', [both])).toBe(3);
  });

  it('skips parts that could belong to either hat quest, then falls back to the default', () => {
    const both = part('Server Hat Quest', 'Official Hat Quest');
    expect(targetPriority('Hat', [both, part('Official Hat Quest')])).toBe(3);
    expect(targetPriority('Hat', [both])).toBe(2);
    expect(targetPriority('Hat', [])).toBe(2);
  });
});

describe('canHavePrice', () => {
  it('has a vend box for any tradeable item, even equipment and cards', () => {
    expect(canHavePrice(item({ actions: ['Vend'] }))).toBe(true);
    expect(canHavePrice(item({ itemType: 'Equipment' }))).toBe(true);
    expect(canHavePrice(item({ categories: ['Card'] }))).toBe(true);
  });

  it('has none for NPC-sold items', () => {
    expect(canHavePrice(item({ npcBuyable: 'yes' }))).toBe(false);
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
      expect(names(select([{ ...mine, actions: ['Junk'] }], review()))).toEqual(['Mine']);
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
  it('does not flag a vend price below the NPC price (players do that)', () => {
    expect(run('suspicious-values', [item({ actions: ['Vend'], avgVend: 50 })])).toEqual([]);
  });

  it('does not flag a price of 0 (checked, nobody is buying)', () => {
    expect(run('suspicious-values', [item({ actions: ['Vend'], avgVend: 0 })])).toEqual([]);
  });

  it('flags a price with no matching action', () => {
    const rows = run('suspicious-values', [item({ actions: ['NPC'], avgVend: 5000 })]);
    expect(rows[0].reasons).toEqual(['Has a vend price but no Vend action']);
  });

  it('flags a vend price with no Vend action, unless the NPC pays more', () => {
    // sellValue 100 is 124z from the NPC with Overcharge.
    const flagged = run('suspicious-values', [item({ actions: ['NPC'], avgVend: 5000 })]);
    expect(flagged[0].reasons).toEqual(['Has a vend price but no Vend action']);
    expect(run('suspicious-values', [item({ actions: ['NPC'], avgVend: 50 })])).toEqual([]);
  });

  it('does not flag Keep on a pet or dungeon quest item: it is kept for that', () => {
    const tame = item({ actions: ['Keep', 'Vend'], categories: ['Pet'], notes: 'Bongun Taming Item' });
    const plate = item({ actions: ['Keep', 'Vend'], categories: ['Dungeon Quest'] });
    expect(run('suspicious-values', [tame, plate])).toEqual([]);
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
      item({ name: 'A Card', categories: ['Card'] }),
      item({ name: 'Pet hat', categories: ['Pet'] }),
      item({ name: 'Plate', categories: ['Dungeon Quest'] }),
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
