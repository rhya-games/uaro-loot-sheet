/**
 * Small rounded label, used for actions and categories.
 *
 * Props:
 *   children  - text inside the badge
 *   className - Tailwind color classes (see src/utils/labels.js)
 *   title     - optional tooltip text
 */
export default function Badge({ children, className = 'bg-gray-100 text-gray-700', title }) {
  return (
    <span
      title={title}
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}
