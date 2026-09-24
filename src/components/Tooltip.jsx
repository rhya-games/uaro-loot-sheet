import { cloneElement, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import { usePresence } from '../utils/usePresence.js';

/** How long the mouse has to rest on something before its tooltip shows. */
const HOVER_DELAY_MS = 300;

/**
 * A small label that appears on hover AND on keyboard focus (unlike the
 * browser's built-in `title`, which keyboard users never see).
 * On hover it waits a moment (HOVER_DELAY_MS) so tooltips don't flash while the
 * mouse passes over things; on keyboard focus it shows right away.
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
  const referenceRef = useRef(null);
  const hoverTimer = useRef(null);

  const show = () => setOpen(true);
  const hide = () => {
    clearTimeout(hoverTimer.current);
    setOpen(false);
  };
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  return (
    <span
      ref={referenceRef}
      className={className}
      onMouseEnter={() => {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(show, HOVER_DELAY_MS);
      }}
      onMouseLeave={hide}
      // Only show for keyboard focus, so a mouse click doesn't leave it stuck open.
      onFocus={(event) => event.target.matches(':focus-visible') && show()}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          hide();
          event.preventDefault(); // so Escape doesn't also close the filter panel
        }
      }}
    >
      {cloneElement(children, { 'aria-describedby': id })}
      {/* What screen readers read. Always present, never shown. */}
      <span id={id} hidden>
        {text}
      </span>
      {mounted && <FloatingLabel reference={referenceRef.current} text={text} placement={placement} visible={visible} />}
    </span>
  );
}

/**
 * The visible tooltip. Only exists while shown, so the positioning work
 * (Floating UI) happens for the one tooltip on screen, not for every
 * tooltip in the table.
 */
function FloatingLabel({ reference, text, placement, visible }) {
  const { refs, floatingStyles } = useFloating({
    elements: { reference },
    placement,
    strategy: 'fixed',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  return createPortal(
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
  );
}
