/** 15500 -> "15,500z". null/undefined -> "—" (no data). */
export function formatZeny(value) {
  if (value == null) return '—';
  return `${value.toLocaleString('en-US')}z`;
}

/** Entries checked longer ago than this just say ">30 Days". */
const MAX_DAYS_SHOWN = 30;

/**
 * How long ago an entry was verified, in plain words:
 *   today -> "Today", yesterday -> "1 day ago", 12 days ago -> "12 days ago",
 *   30+ days ago or never -> ">30 Days".
 *
 * `dateText` is "YYYY-MM-DD" (or null). `today` can be passed in for testing.
 */
export function formatVerified(dateText, today = new Date()) {
  if (!dateText) return `>${MAX_DAYS_SHOWN} Days`;
  // Compare calendar days in the viewer's time zone.
  const [year, month, day] = dateText.split('-').map(Number);
  const verified = new Date(year, month - 1, day);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysAgo = Math.round((startOfToday - verified) / (24 * 60 * 60 * 1000));

  if (daysAgo >= MAX_DAYS_SHOWN) return `>${MAX_DAYS_SHOWN} Days`;
  if (daysAgo <= 0) return 'Today';
  if (daysAgo === 1) return '1 day ago';
  return `${daysAgo} days ago`;
}

/** Tooltip for the Verified column: the exact date and any notes. */
export function verifiedTooltip(item) {
  if (!item.lastVerified) return 'Never verified';
  return [`Verified ${item.lastVerified}`, item.verificationNotes].filter(Boolean).join(': ');
}
