/**
 * Small colored label, used for actions and categories.
 *
 * Props:
 *   children  - text inside the badge
 *   className - Tailwind color classes (see src/utils/labels.js)
 *   style     - optional inline colors, for colors calculated in code
 *   shape     - "pill" (fully round, used for actions) or
 *               "tag" (slightly rounded, used for categories)
 *   title     - optional tooltip text
 *
 * `text-box: trim-both cap alphabetic` trims the extra space fonts add above
 * and below letters, so the text sits exactly in the vertical center.
 */
export default function Badge({ children, className = '', style, shape = 'pill', title }) {
  return (
    <span
      title={title}
      style={style}
      className={`inline-block px-2.5 py-1.5 text-xs font-medium whitespace-nowrap [text-box:trim-both_cap_alphabetic]
        ${shape === 'pill' ? 'rounded-full' : 'rounded-md'} ${className}`}
    >
      {children}
    </span>
  );
}
