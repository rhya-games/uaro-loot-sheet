/** 15500 -> "15,500z". null/undefined -> "—" (no data). */
export function formatZeny(value) {
  if (value == null) return '—';
  return `${value.toLocaleString('en-US')}z`;
}
