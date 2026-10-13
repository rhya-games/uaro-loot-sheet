import { describe, expect, it } from 'vitest';
import { bestSale } from './prices.js';

/** A made-up item; itemId 1 isn't in any uaRO override list. */
const item = (fields) => ({
  itemId: 1,
  itemType: 'Misc',
  categories: [],
  npcBuyable: 'no',
  sellValue: 100, // NPC pays 124 with Overcharge
  avgVend: null,
  ...fields,
});

describe('bestSale', () => {
  it('is vend only when players pay more than the NPC', () => {
    expect(bestSale(item({ avgVend: 125 }))).toBe('vend');
    expect(bestSale(item({ avgVend: 124 }))).toBe('npc'); // the same: NPC is easier
    expect(bestSale(item({ avgVend: 123 }))).toBe('npc');
  });

  it('is the NPC when nobody is selling to players (checked, price 0)', () => {
    expect(bestSale(item({ avgVend: 0 }))).toBe('npc');
  });

  it('cannot be told without a vend price', () => {
    expect(bestSale(item({}))).toBeNull();
  });

  it('is always vend for a card, even with no price, and never the NPC', () => {
    expect(bestSale(item({ categories: ['Card'], avgVend: 5 }))).toBe('vend'); // below the NPC price
    expect(bestSale(item({ categories: ['Card'], avgVend: 0 }))).toBe('vend');
    expect(bestSale(item({ categories: ['Card'] }))).toBe('vend');
  });

  it('is always vend for strong food (+6 or more), even with no price, never the NPC', () => {
    const food = { categories: ['Cooking'], notes: '+9 VIT for 20 minutes' };
    expect(bestSale(item({ ...food, avgVend: 5 }))).toBe('vend');
    expect(bestSale(item({ ...food, avgVend: 0 }))).toBe('vend');
    expect(bestSale(item(food))).toBe('vend');
    expect(bestSale(item({ ...food, npcBuyable: 'yes' }))).toBeNull();
    expect(bestSale(item({ ...food, notes: '+5 VIT for 20 minutes', avgVend: 5 }))).toBe('npc');
  });

  it('is vend for cheap equipment with no vend price, until a price is known', () => {
    const gear = { itemType: 'Equipment', sellValue: 1000 }; // NPC pays 1,240
    expect(bestSale(item(gear))).toBe('vend');
    expect(bestSale(item({ ...gear, avgVend: 500 }))).toBe('npc'); // a known price decides
    expect(bestSale(item({ ...gear, sellValue: 3000 }))).toBeNull(); // 3,720: not cheap
    expect(bestSale(item({ ...gear, sellValue: null }))).toBeNull(); // no NPC price to go on
  });

  it('is vend for a taming item under 1,000z at NPCs with no vend price', () => {
    const taming = { categories: ['Pet'], notes: 'Poring Taming Item', sellValue: 500 }; // NPC pays 620
    expect(bestSale(item(taming))).toBe('vend');
    expect(bestSale(item({ ...taming, sellValue: 1000 }))).toBeNull(); // 1,240: not cheap
    expect(bestSale(item({ ...taming, avgVend: 100 }))).toBe('npc');
  });

  it('is nobody for a pet accessory no one is selling', () => {
    const accessory = { notes: 'Poring Pet accessory', categories: ['Pet'], itemType: 'Equipment' };
    expect(bestSale(item({ ...accessory, avgVend: 0 }))).toBeNull();
    expect(bestSale(item({ ...accessory, avgVend: 5000 }))).toBe('vend');
  });

  it('cannot be told for items NPCs sell', () => {
    expect(bestSale(item({ npcBuyable: 'yes', avgVend: 9999 }))).toBeNull();
  });

  it('counts an NPC that will not buy it as 0z', () => {
    expect(bestSale(item({ sellValue: null, avgVend: 5 }))).toBe('vend');
    expect(bestSale(item({ sellValue: null, avgVend: 0 }))).toBeNull();
  });
});
