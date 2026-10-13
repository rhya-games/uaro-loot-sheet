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

  it("keeps today's earlier notes, without repeating one", () => {
    const earlier = { lastVerified: today, verificationNotes: CHECK_NOTES.avgVend };
    expect(priceChanges(earlier, { avgVend: 900 }, today).verificationNotes).toBe(CHECK_NOTES.avgVend);
  });

  it('starts fresh when the earlier check was another day', () => {
    const old = { lastVerified: '2026-09-01', verificationNotes: 'Something older' };
    expect(priceChanges(old, { avgVend: 500 }, today).verificationNotes).toBe(CHECK_NOTES.avgVend);
  });

  it("doesn't touch Verified when a price is cleared", () => {
    expect(priceChanges({ lastVerified: today, verificationNotes: 'x' }, { avgVend: null }, today)).toEqual({ avgVend: null });
  });
});

describe('confirmChanges', () => {
  it('marks the price as checked today and notes it', () => {
    expect(confirmChanges({ avgVend: 5000 })).toEqual({ lastVerified: todayText(), verificationNotes: CHECK_NOTES.avgVend });
  });

  it('counts a price of 0 ("nobody is selling") as checked', () => {
    expect(confirmChanges({ avgVend: 0 }).verificationNotes).toBe(CHECK_NOTES.avgVend);
  });
});
