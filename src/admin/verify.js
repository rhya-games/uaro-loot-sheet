import { todayText } from '../utils/format.js';

/** What the Verified note says for a price checked in game. */
export const CHECK_NOTES = {
  avgVend: 'Vend price from a player shop',
  avgWhobuy: '@whobuy price in game',
};

/**
 * The changes that mark an item's current prices as checked in game today,
 * without changing them. The note lists each price that is set (a price of
 * 0, "nobody's buying", was checked too).
 */
export function confirmChanges(item) {
  const notes = Object.keys(CHECK_NOTES).filter((field) => item[field] != null).map((field) => CHECK_NOTES[field]);
  return { lastVerified: todayText(), verificationNotes: notes.join('; ') };
}
