import { cloneElement, useId, useState } from 'react';

/**
 * A small label that appears on hover AND on keyboard focus (unlike the
 * browser's built-in `title`, which keyboard users never see).
 * Press Escape to hide it. Screen readers read it as the element's description.
 *
 * Wrap exactly one focusable element (button, link, or tabIndex={0}):
 *
 *   <Tooltip text="Report issue">
 *     <a href="...">...</a>
 *   </Tooltip>
 *
 * Props:
 *   text      - tooltip text
 *   placement - "top" (default) or "bottom"
 *   children  - the element the tooltip describes
 */
export default function Tooltip({ text, placement = 'top', children }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      // Only show for keyboard focus, so a mouse click doesn't leave it stuck open.
      onFocus={(event) => setVisible(event.target.matches(':focus-visible'))}
      onBlur={() => setVisible(false)}
      onKeyDown={(event) => event.key === 'Escape' && setVisible(false)}
    >
      {cloneElement(children, { 'aria-describedby': id })}
      {/* `hidden` removes it from the layout (so it can't cause sideways scrolling);
          screen readers still read it through aria-describedby. */}
      <span
        id={id}
        role="tooltip"
        hidden={!visible}
        className={`pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs
          font-medium whitespace-nowrap text-white shadow-md ${placement === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'}`}
      >
        {text}
      </span>
    </span>
  );
}
