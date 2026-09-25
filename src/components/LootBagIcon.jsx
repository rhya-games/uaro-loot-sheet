/**
 * The site's loot bag: a sack gathered at the top, tied with a cord, with a
 * "z" for zeny. Drawn in `currentColor`, with the details (cord, z) in
 * `detailColor` so they read on any background. public/favicon.svg is the
 * same drawing on the header green; keep the two in step.
 *
 * Props:
 *   className   - size and color, e.g. "size-10 text-white"
 *   detailColor - color of the cord and the z (default: the header green)
 */
export default function LootBagIcon({ className = '', detailColor = 'var(--header)' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {/* Gathered cloth above the cord, flaring out like a fan. */}
      <path d="M10 4.5c2 1.3 4 1.8 6 1.8s4-.5 6-1.8l-3 5.5h-6z" fill="currentColor" />
      {/* The bag itself. */}
      <path
        d="M13 11h6c4.4 1.8 7.5 6.2 7.5 10.4 0 4.2-3.8 6.1-10.5 6.1S5.5 25.6 5.5 21.4C5.5 17.2 8.6 12.8 13 11z"
        fill="currentColor"
      />
      {/* The cord tied around the neck. */}
      <rect x="11.5" y="9.3" width="9" height="2.4" rx="1.2" fill={detailColor} />
      <text
        x="16"
        y="24.2"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        fill={detailColor}
      >
        z
      </text>
    </svg>
  );
}
