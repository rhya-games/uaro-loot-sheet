/**
 * Small per-browser settings (e.g. "I don't keep items"), saved in
 * localStorage so they're remembered on the next visit.
 *
 * localStorage can be unavailable (private windows, blocked storage), so every
 * read and write is wrapped in try/catch and falls back to the default.
 */
const PREFIX = 'uaro-loot-sheet:';

export function readPreference(key, fallback) {
  try {
    const stored = window.localStorage.getItem(PREFIX + key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch {
    return fallback;
  }
}

export function writePreference(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Not saved; the setting still works for this visit.
  }
}
