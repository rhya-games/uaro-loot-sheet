import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { usePresence } from '../utils/usePresence.js';
import { NO_HIGHLIGHT, highlightedUseTest } from '../utils/highlight.js';

/** How many uses to show before the rest go behind "+N more". */
const MAX_USES_SHOWN = 6;


/**
 * Shows what an item is used for, plus any extra notes.
 *   e.g. "x10 Mystic Rose  x6 Little Isis Pet Evolution  x10 Veins Siblings Quest (each try)"
 *
 * Each use reads as one line of text ("x500 Sweet Drops Pet Evolution") that
 * wraps like a normal sentence. Clicking the target shows every item used
 * for it (via the "Used For" filter).
 *
 * Uses are listed A-Z. Long lists (Poring Coin is used for 40+ things) show
 * the first few, then a "+N more" button that opens the rest in a popover.
 *
 * Uses the visitor is looking for move to the front and get a soft
 * highlight (the others stay as they are), so it's easy to see why the
 * item is listed:
 *   - targets picked in the "Used For" filter, always
 *   - uses the search text matches as whole words, but only when the search
 *     didn't match the item's own name (searching "Gold" shows Gold's list
 *     as usual; searching "Headset" brings "x1 Headset" forward on Coal)
 *
 * Props:
 *   item        - one entry from loot.json
 *   onSelectUse - called with a target name, e.g. "Mystic Rose"
 *   highlight   - { targets: ["Love Guard [1]"], matchesSearch: (text) => bool | null } (optional)
 */
export default function ItemUses({ item, onSelectUse, highlight = NO_HIGHLIGHT }) {
  if (item.uses.length === 0 && !item.notes) return null;
  const isMatch = highlightedUseTest(item, highlight);
  const uses = [...item.uses].sort((a, b) => isMatch(b) - isMatch(a) || a.for.localeCompare(b.for));
  const shown = uses.slice(0, MAX_USES_SHOWN);
  const hidden = uses.slice(MAX_USES_SHOWN);
  // The padding and negative margin give the highlight some room without moving the text.
  const marked = (use) => (isMatch(use) ? '-mx-1 rounded bg-accent-soft px-1 ring-1 ring-accent-line/40' : '');

  return (
    <div className="space-y-1 text-body">
      {item.uses.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {shown.map((use, index) => (
            <li key={`${use.for}-${index}`} className={marked(use)}>
              <UseText use={use} onSelectUse={onSelectUse} />
            </li>
          ))}
          {hidden.length > 0 && (
            <li>
              <MoreUsesPopover item={item} uses={hidden} marked={marked} onSelectUse={onSelectUse} />
            </li>
          )}
        </ul>
      )}
      {item.notes && <p className="text-muted">{item.notes}</p>}
    </div>
  );
}

/** One use: "x10 Mystic Rose (note)". */
function UseText({ use, onSelectUse }) {
  return (
    <>
      <span className="text-muted tabular-nums">x{use.qty?.toLocaleString('en-US') ?? '?'}</span>{' '}
      <InlineButton onClick={() => onSelectUse(use.for)}>{use.for}</InlineButton>
      {use.note && <span className="text-muted"> ({use.note})</span>}
    </>
  );
}

/**
 * "+N more" button that opens the uses that didn't fit in a small popover
 * next to it.
 * It's a non-modal dialog:
 *   - opening it moves focus inside; Escape closes it and returns focus
 *   - clicking outside, or picking a use, closes it
 * Like tooltips, it's drawn at the end of the page and positioned with
 * Floating UI, so the table's scroll box can't cut it off.
 */
function MoreUsesPopover({ item, uses, marked, onSelectUse }) {
  const [open, setOpen] = useState(false);
  const { mounted, visible } = usePresence(open, 150);
  const dialogId = useId();
  const titleId = useId();
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      // Never taller than the space available; the list scrolls instead.
      size({
        padding: 8,
        apply: ({ availableHeight, elements }) => {
          elements.floating.style.maxHeight = `${Math.max(160, Math.min(availableHeight, 384))}px`;
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });
  const setButton = (element) => {
    buttonRef.current = element;
    refs.setReference(element);
  };
  const setPopover = (element) => {
    popoverRef.current = element;
    refs.setFloating(element);
  };

  const close = ({ returnFocus = false } = {}) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  // Once open, focus the popover so keyboard users land inside it.
  useEffect(() => {
    if (open && mounted) popoverRef.current?.focus();
  }, [open, mounted]);

  // Close when clicking anywhere outside.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!popoverRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      // Mark it handled, so the filter panel's Escape doesn't also fire.
      event.preventDefault();
      close({ returnFocus: true });
    }
  };

  return (
    <>
      <button
        ref={setButton}
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        className="cursor-pointer rounded font-medium text-accent hover:underline"
      >
        +{uses.length} more
        <span className="sr-only"> uses for {item.name}</span>
      </button>
      {mounted &&
        createPortal(
          <div
            ref={setPopover}
            style={floatingStyles}
            id={dialogId}
            role="dialog"
            aria-labelledby={titleId}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            // Fades and grows in from the button's corner (instant with reduced motion).
            className={`panel z-[55] flex w-80 max-w-[calc(100vw-2rem)] origin-top-left flex-col text-left text-sm
              transition duration-150 ease-smooth outline-none motion-reduce:transition-none
              ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
              <h2 id={titleId} className="font-semibold text-fg">
                {item.name}: {uses.length} more uses
              </h2>
              <button
                type="button"
                onClick={() => close({ returnFocus: true })}
                aria-label="Close"
                className="flex size-7 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-fg"
              >
                <XMarkIcon className="size-5" aria-hidden="true" />
              </button>
            </div>
            <ul className="space-y-1 overflow-y-auto px-3 py-2 text-body">
              {uses.map((use, index) => (
                <li key={`${use.for}-${index}`} className={marked(use)}>
                  <UseText
                    use={use}
                    onSelectUse={(target) => {
                      close();
                      onSelectUse(target);
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}

/**
 * A button that wraps like normal text. Real <button>s can't do that
 * (browsers always draw them as a box), so this is a <span> that behaves
 * like a button: focusable, announced as a button, and works with Enter and
 * Space. This is the standard ARIA "button" pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
function InlineButton({ onClick, children, ...rest }) {
  return (
    <span
      {...rest}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer text-accent underline decoration-accent/30 underline-offset-2 [box-decoration-break:clone]
        hover:decoration-accent"
    >
      {children}
    </span>
  );
}
