import { describe, expect, it } from 'vitest';
import { EMPTY_FILTERS, addedFilters } from './filter.js';

describe('addedFilters', () => {
  it('lists only newly checked options, with their group title', () => {
    const before = { ...EMPTY_FILTERS, actions: ['Keep'] };
    const after = { ...EMPTY_FILTERS, actions: ['Keep', 'Vend'], categories: ['Pet'] };
    expect(addedFilters(before, after)).toEqual([
      { group: 'Action', value: 'Vend' },
      { group: 'Category', value: 'Pet' },
    ]);
  });

  it('ignores unchecked options', () => {
    expect(addedFilters({ ...EMPTY_FILTERS, actions: ['Keep'] }, EMPTY_FILTERS)).toEqual([]);
  });
});
