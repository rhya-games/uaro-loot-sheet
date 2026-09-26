import { describe, expect, it } from 'vitest';
import { todayText } from '../utils/format.js';
import { CHECK_NOTES, confirmChanges, priceChanges } from './verify.js';

describe('priceChanges', () => {
  const item = { lastVerified: null, verificationNotes: '' };
  const today = '2026-09-26';

  it('saves the price and marks it verified today with a note', () => {
    expect(priceChanges(item, { avgVend: 500 }, today)).toEqual({
      avgVend: 500,
      lastVerified: today,
      verificationNotes: CHECK_NOTES.avgVend,
    });
  });

  it('notes both prices when both are given, and only changes the fields given', () => {
    const changes = priceChanges(item, { avgVend: 500, avgWhobuy: 0 }, today);
    expect(changes.verificationNotes).toBe(`${CHECK_NOTES.avgVend}; ${CHECK_NOTES.avgWhobuy}`);
    expect(priceChanges(item, { avgVend: 500 }, today)).not.toHaveProperty('avgWhobuy');
  });

  it("keeps today's earlier notes, without repeating one", () => {
    const earlier = { lastVerified: today, verificationNotes: CHECK_NOTES.avgVend };
    expect(priceChanges(earlier, { avgWhobuy: 300 }, today).verificationNotes).toBe(`${CHECK_NOTES.avgVend}; ${CHECK_NOTES.avgWhobuy}`);
    expect(priceChanges(earlier, { avgVend: 900 }, today).verificationNotes).toBe(CHECK_NOTES.avgVend);
  });

  it('starts fresh when the earlier check was another day', () => {
    const old = { lastVerified: '2026-09-01', verificationNotes: CHECK_NOTES.avgWhobuy };
    expect(priceChanges(old, { avgVend: 500 }, today).verificationNotes).toBe(CHECK_NOTES.avgVend);
  });

  it("doesn't touch Verified when a price is cleared", () => {
    expect(priceChanges({ lastVerified: today, verificationNotes: 'x' }, { avgVend: null }, today)).toEqual({ avgVend: null });
  });
});

describe('confirmChanges', () => {
  it('marks the prices as checked today and notes each price that is set', () => {
    const both = confirmChanges({ avgVend: 5000, avgWhobuy: 4000 });
    expect(both).toEqual({ lastVerified: todayText(), verificationNotes: `${CHECK_NOTES.avgVend}; ${CHECK_NOTES.avgWhobuy}` });
    expect(confirmChanges({ avgVend: 5000, avgWhobuy: null }).verificationNotes).toBe(CHECK_NOTES.avgVend);
  });

  it('counts a price of 0 ("nobody is buying") as checked', () => {
    expect(confirmChanges({ avgVend: null, avgWhobuy: 0 }).verificationNotes).toBe(CHECK_NOTES.avgWhobuy);
  });
});
