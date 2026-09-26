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

/**
 * The changes for saving new prices on an item: the prices themselves
 * (`prices`, like { avgVend: 5000 }; only the fields given change), and, for
 * each price that is set, today's date and a note saying where it came from.
 * If the item was already verified today, its earlier notes stay ("Vend price
 * ...; @whobuy price ..."). Clearing a price (null) isn't a check in game, so
 * it doesn't touch Verified.
 */
export function priceChanges(item, prices, today = todayText()) {
  const fields = Object.keys(CHECK_NOTES).filter((field) => prices[field] != null);
  if (!fields.length) return { ...prices };
  const kept = item.lastVerified === today && item.verificationNotes ? item.verificationNotes.split('; ') : [];
  const notes = [...kept, ...fields.map((field) => CHECK_NOTES[field]).filter((note) => !kept.includes(note))];
  return { ...prices, lastVerified: today, verificationNotes: notes.join('; ') };
}
