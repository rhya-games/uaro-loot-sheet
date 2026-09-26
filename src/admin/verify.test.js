import { describe, expect, it } from 'vitest';
import { todayText } from '../utils/format.js';
import { CHECK_NOTES, confirmChanges } from './verify.js';

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
