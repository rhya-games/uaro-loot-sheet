/** 15500 -> "15,500z". null/undefined -> "?" (not checked yet). */
export function formatZeny(value) {
  if (value == null) return '?';
  return `${value.toLocaleString('en-US')}z`;
}

/** Today's date as "YYYY-MM-DD", in this computer's time zone. */
export function todayText(now = new Date()) {
  const pad = (number) => String(number).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Turns typed text into zeny: "12000", "12,000", "12k", "1.5m" -> a whole
 * number. "None" -> 0 (checked, nobody buying or selling). Empty -> null
 * (not checked). Anything else -> undefined (invalid).
 */
export function parseZeny(text) {
  const clean = text.trim().toLowerCase().replace(/[,\sz]/g, '');
  if (clean === '') return null;
  if (clean === 'none') return 0;
  const match = clean.match(/^(\d+(?:\.\d+)?)([km]?)$/);
  if (!match) return undefined;
  const multiplier = { '': 1, k: 1_000, m: 1_000_000 }[match[2]];
  return Math.round(Number(match[1]) * multiplier);
}
