/**
 * The one chip style used everywhere: actions, categories, and active filters.
 * Only the colors change between uses, so every chip has the same size and shape.
 *
 * Props:
 *   children    - text inside the chip
 *   className   - Tailwind color classes (see src/utils/labels.js)
 *   style       - optional inline colors, for colors calculated in code
 *   title       - optional tooltip text
 *   onRemove    - optional: shows a × button that calls this
 *   removeLabel - screen reader text for the × button, e.g. "Remove Card filter"
 *
 * `text-box: trim-both cap alphabetic` trims the extra space fonts add above
 * and below letters, so the text sits exactly in the vertical center.
 */
export default function Badge({ children, className = '', style, title, onRemove, removeLabel }) {
  return (
    <span
      title={title}
      style={style}
      className={`inline-block rounded-full px-2.5 py-1.5 text-xs font-medium whitespace-nowrap
        [text-box:trim-both_cap_alphabetic] ${className}`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="ml-1.5 leading-none opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </span>
  );
}
