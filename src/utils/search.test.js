import { describe, expect, it } from 'vitest';
import { createSearch, wordMatcher } from './search.js';

const item = (name, extra = {}) => ({ name, itemId: 0, uses: [], notes: '', categories: [], ...extra });
const items = [
  item('Blue Gemstone', { itemId: 717 }),
  item('Cracked Diamond', { itemId: 733 }),
  item('Coal', { uses: [{ for: 'Headset', qty: 1 }] }),
  item('Diamond Ring [0]', { itemId: 2613 }),
];
const names = (results) => results.map((result) => result.name);

describe('search', () => {
  const search = createSearch(items);

  it('finds by item ID', () => {
    expect(names(search('717'))).toEqual(['Blue Gemstone']);
  });

  it('ranks names starting with the search first', () => {
    expect(names(search('diamond'))).toEqual(['Diamond Ring [0]', 'Cracked Diamond']);
  });

  it('finds items by what they are used for', () => {
    expect(names(search('headset'))).toEqual(['Coal']);
  });

  it('forgives typos only when nothing matches exactly', () => {
    expect(names(search('diamnod'))).toContain('Cracked Diamond');
  });

  it('returns everything for an empty search', () => {
    expect(search('  ')).toBe(items);
  });
});

describe('wordMatcher', () => {
  it('matches whole words only', () => {
    const matches = wordMatcher('gold');
    expect(matches('Gold')).toBe(true);
    expect(matches('Golden Bell')).toBe(false);
  });

  it('needs at least two letters', () => {
    expect(wordMatcher('g')).toBeNull();
  });
});
