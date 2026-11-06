import { describe, expect, it } from 'vitest';
import { sharedUseTargets } from './sharedUses.js';

const item = (...targets) => ({ uses: targets.map((name) => ({ for: name, qty: 1 })) });

describe('sharedUseTargets', () => {
  it('keeps targets used by two or more items', () => {
    const items = [item('Mystic Rose', 'Solo Quest'), item('Mystic Rose')];
    expect([...sharedUseTargets(items)]).toEqual(['Mystic Rose']);
  });

  it('counts an item once even if it lists a target twice', () => {
    expect(sharedUseTargets([item('Solo Quest', 'Solo Quest')]).size).toBe(0);
  });
});
