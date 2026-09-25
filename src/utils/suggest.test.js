import { describe, expect, it } from 'vitest';
import { createSuggester, suggestSale } from './suggest.js';

/** A made-up item; itemId 1 isn't in any uaRO override list. */
const item = (fields) => ({
  name: 'Test Item',
  itemId: 1,
  itemType: 'Misc',
  categories: [],
  uses: [],
  actions: [],
  npcBuyable: 'no',
  sellValue: 100, // NPC pays 124 with Overcharge
  avgVend: null,
  avgWhobuy: null,
  ...fields,
});

describe('suggestSale', () => {
  it('waits for a player price instead of guessing NPC', () => {
    expect(suggestSale(item({}))).toBeNull();
  });

  it('picks NPC when players pay less than 15% more', () => {
    expect(suggestSale(item({ avgVend: 140 })).action).toBe('NPC');
  });

  it('picks Vend when it pays enough more', () => {
    expect(suggestSale(item({ avgVend: 1000 })).action).toBe('Vend');
  });

  it('picks Whobuy when it beats vending', () => {
    expect(suggestSale(item({ avgVend: 500, avgWhobuy: 800 })).action).toBe('Whobuy');
  });

  it('always says Vend for cards, even without a price', () => {
    expect(suggestSale(item({ categories: ['Card'] })).action).toBe('Vend');
  });

  it('says NPC for items NPCs sell', () => {
    expect(suggestSale(item({ npcBuyable: 'yes', avgVend: 9999 })).action).toBe('NPC');
  });
});

describe('createSuggester', () => {
  it('keeps an item for something with no value yet, next to how to sell it', () => {
    const part = item({ name: 'Part', avgVend: 1000, uses: [{ for: 'Some Quest', qty: 5 }] });
    expect(createSuggester([part])(part).actions).toEqual(['Keep', 'Vend']);
  });

  it("doesn't keep for level 1-3 cooking", () => {
    const fruit = item({ name: 'Fruit', avgVend: 1000, uses: [{ for: 'Snack', qty: 5, note: '+2 DEX food' }] });
    expect(createSuggester([fruit])(fruit).actions).toEqual(['Vend']);
  });

  it('keeps parts when the finished item is worth more than they sell for', () => {
    const part = item({ name: 'Part', avgVend: 1000, uses: [{ for: 'Hat', qty: 2 }] });
    const hat = item({ name: 'Hat', avgVend: 50000 });
    expect(createSuggester([part, hat])(part).actions).toContain('Keep');
  });

  it("doesn't keep parts worth more than the finished item", () => {
    const part = item({ name: 'Part', avgVend: 100000, uses: [{ for: 'Hat', qty: 2 }] });
    const hat = item({ name: 'Hat', avgVend: 50000 });
    expect(createSuggester([part, hat])(part).actions).toEqual(['Vend']);
  });

  it('calls a cheap pet accessory nothing needs Junk', () => {
    const accessory = item({ name: 'Wig', itemId: 10005, itemType: 'Equipment', avgVend: 2500 });
    expect(createSuggester([accessory])(accessory).actions).toEqual(['Junk']);
  });
});
