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

  it('picks NPC when players pay the same or less', () => {
    expect(suggestSale(item({ avgVend: 124 })).action).toBe('NPC');
    expect(suggestSale(item({ avgVend: 100 })).action).toBe('NPC');
  });

  it('picks Vend for any price above the NPC price', () => {
    expect(suggestSale(item({ avgVend: 125 })).action).toBe('Vend');
  });

  it('picks Whobuy for any price above the NPC price', () => {
    expect(suggestSale(item({ avgWhobuy: 125 })).action).toBe('Whobuy');
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

  it('never suggests Keep alone: with no player price yet, Vend goes next to it', () => {
    const part = item({ name: 'Part', uses: [{ for: 'Some Quest', qty: 5 }] });
    expect(createSuggester([part])(part).actions).toEqual(['Keep', 'Vend']);
  });

  it('keeps for a quest even when a value is set for it', () => {
    const part = item({ name: 'Part', avgVend: 1000, uses: [{ for: 'Sign Quest', qty: 5 }] });
    const values = new Map([['Sign Quest', 0]]);
    expect(createSuggester([part], values)(part).actions).toEqual(['Keep', 'Vend']);
  });

  it('keeps a cooking kit, unless NPCs sell it', () => {
    const use = [{ for: 'Cooking', qty: 1, note: 'used up each time you cook' }];
    const kit = item({ name: 'Royal Cooking Kit', avgVend: 3000, uses: use });
    expect(createSuggester([kit])(kit).actions).toEqual(['Keep', 'Vend']);
    const cheap = item({ name: 'Home Cooking Kit', npcBuyable: 'yes', uses: use });
    expect(createSuggester([cheap])(cheap).actions).toEqual(['NPC']);
  });

  it("doesn't keep extras of something that isn't used up, and it isn't Junk", () => {
    const whip = item({ name: 'Whip', sellValue: 0, avgVend: 0, uses: [{ for: 'Mask', note: 'any whip; not used up' }] });
    expect(createSuggester([whip])(whip).actions).toEqual([]);
    const sold = { ...whip, avgVend: 5000 };
    expect(createSuggester([sold])(sold).actions).toEqual(['Vend']);
  });

  it("doesn't keep for skills, and a skill item isn't Junk", () => {
    const gem = item({ name: 'Gem', avgVend: 1000, uses: [{ for: 'Safety Wall', note: 'each cast' }] });
    expect(createSuggester([gem])(gem).actions).toEqual(['Vend']);
    const free = item({ name: 'Gem', sellValue: 0, avgVend: 0, uses: [{ for: 'Safety Wall', note: 'each cast' }] });
    expect(createSuggester([free])(free).actions).toEqual([]);
  });

  it("doesn't keep for job quests, and a job quest item isn't Junk", () => {
    const emblem = item({ name: 'Emblem', avgVend: 1000, uses: [{ for: 'Crusader Job Quest', qty: 1 }] });
    const suggestion = createSuggester([emblem])(emblem);
    expect(suggestion.actions).toEqual(['Vend']);
    expect(suggestion.reasons.join(' ')).toMatch(/Job quests \(Crusader Job Quest\)/);
    // Another quest still counts.
    const both = { ...emblem, uses: [...emblem.uses, { for: 'Sign Quest', qty: 1 }] };
    expect(createSuggester([both])(both).actions).toEqual(['Keep', 'Vend']);
    const free = item({ name: 'Emblem', sellValue: 0, avgVend: 0, uses: [{ for: 'Crusader Job Quest', qty: 1 }] });
    expect(createSuggester([free])(free).actions).toEqual([]);
  });

  it('keeps parts of a target no shops sell (value 0)', () => {
    const part = item({ name: 'Part', avgVend: 1000, uses: [{ for: 'Hat', qty: 2 }] });
    const suggestion = createSuggester([part], new Map([['Hat', 0]]))(part);
    expect(suggestion.actions).toEqual(['Keep', 'Vend']);
    expect(suggestion.reasons[0]).toMatch(/no shops/);
  });

  it('uses the target values it is given', () => {
    const part = item({ name: 'Part', avgVend: 1000, uses: [{ for: 'Hat', qty: 2 }] });
    expect(createSuggester([part], new Map([['Hat', 1500]]))(part).actions).toEqual(['Vend']);
    expect(createSuggester([part], new Map([['Hat', 5000]]))(part).actions).toEqual(['Keep', 'Vend']);
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

  it('sells a cheap pet accessory by price like anything else', () => {
    const accessory = item({ name: 'Wig', itemId: 10005, itemType: 'Equipment', avgVend: 2500 });
    expect(createSuggester([accessory])(accessory).actions).toEqual(['Vend']);
  });
});
