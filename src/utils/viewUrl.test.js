import { describe, expect, it } from 'vitest';
import { EMPTY_VIEW, cleanView, hashToView, viewToHash } from './viewUrl.js';

const view = {
  query: 'glacial heart',
  filters: { actions: ['Keep', 'Vend'], itemTypes: [], categories: ['Official Hat Quest'], usedFor: ['Love Guard [1]'] },
  sort: { key: 'avgVend', direction: 'desc' },
};

describe('share links', () => {
  it('writes a readable link', () => {
    expect(viewToHash(view)).toBe(
      '#/?q=glacial+heart&action=Keep,Vend&category=Official+Hat+Quest&used=Love+Guard+[1]&sort=vend-desc',
    );
  });

  it('reads back the same view', () => {
    expect(hashToView(viewToHash(view))).toEqual(view);
  });

  it('is just "#/" for an empty view, and has no view for other pages', () => {
    expect(viewToHash(EMPTY_VIEW)).toBe('#/');
    expect(hashToView('#/about')).toBeNull();
  });

  it('skips unknown or broken parts instead of failing', () => {
    expect(hashToView('#/?action=Keep,Bogus&sort=vend-sideways&q=%E0%A4%A&zzz=1')).toEqual({
      ...EMPTY_VIEW,
      filters: { ...EMPTY_VIEW.filters, actions: ['Keep'] },
    });
  });

  it('cleans a stored view that could hold anything', () => {
    expect(cleanView(null)).toEqual(EMPTY_VIEW);
    expect(cleanView({ query: 5, filters: { actions: 'Keep' } })).toEqual(EMPTY_VIEW);
  });
});
