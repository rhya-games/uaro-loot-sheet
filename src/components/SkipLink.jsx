/**
 * A keyboard shortcut link that's invisible until it gets focus (Tab),
 * letting keyboard users jump past repeated content.
 *
 * It moves focus with code instead of changing the URL, because the URL's
 * "#" part is used to switch pages (see utils/route.js).
 *
 * Props:
 *   targetId  - id of the element to jump to (it needs tabIndex={-1})
 *   children  - link text, e.g. "Skip to main content"
 *   className - optional extra classes (e.g. positioning)
 */
export default function SkipLink({ targetId, children, className = '' }) {
  const jump = (event) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    target?.focus();
    target?.scrollIntoView({ block: 'start' });
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={jump}
      // `not-sr-only` resets padding to 0, so the padding is set again for the focused state.
      className={`sr-only rounded-lg bg-surface text-sm font-semibold text-accent shadow-md
        focus:not-sr-only focus:inline-block focus:px-4 focus:py-2 ${className}`}
    >
      {children}
    </a>
  );
}
