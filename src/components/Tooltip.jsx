import { cloneElement, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import { usePresence } from '../utils/usePresence.js';

/**
 * A small label that appears on hover AND on keyboard focus (unlike the
 * browser's built-in `title`, which keyboard users never see).
 * Press Escape to hide it. Screen readers read it as the element's description.
 *
 * It's drawn at the end of the page (a "portal") and positioned with
 * Floating UI (https://floating-ui.com), so scrolling boxes can't cut it off:
 * it flips to the other side or slides over when there isn't room.
 *
 * Wrap exactly one focusable element (button, link, or tabIndex={0}):
 *
 *   <Tooltip text="Report issue">
 *     <a href="...">...</a>
 *   </Tooltip>
 *
 * Props:
 *   text      - tooltip text
 *   placement - preferred side: "top" (default) or "bottom"
 *   className - layout of the wrapper around the element (default "inline-flex").
 *               Use "" for text that should wrap like a sentence, "flex w-full"
 *               to fill a table cell.
 *   children  - the element the tooltip describes
 */
export default function Tooltip({ text, placement = 'top', className = 'inline-flex', children }) {
  const [open, setOpen] = useState(false);
  const { mounted, visible } = usePresence(open, 150);
  const id = useId();
  const { refs, floatingStyles } = useFloating({
    placement,
    strategy: 'fixed',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  return (
    <span
      ref={refs.setReference}
      className={className}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      // Only show for keyboard focus, so a mouse click doesn't leave it stuck open.
      onFocus={(event) => setOpen(event.target.matches(':focus-visible'))}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          event.preventDefault(); // so Escape doesn't also close the filter panel
        }
      }}
    >
      {cloneElement(children, { 'aria-describedby': id })}
      {/* What screen readers read. Always present, never shown. */}
      <span id={id} hidden>
        {text}
      </span>
      {mounted &&
        createPortal(
          <span
            ref={refs.setFloating}
            style={floatingStyles}
            aria-hidden="true"
            className={`pointer-events-none z-[60] rounded-md bg-gray-900 px-2 py-1 text-xs font-medium whitespace-nowrap
              text-white shadow-md transition-opacity duration-150 ease-smooth dark:border dark:border-line-strong
              dark:bg-hover dark:text-fg motion-reduce:transition-none ${visible ? 'opacity-100' : 'opacity-0'}`}
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  );
}
