import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Tooltip from '../components/Tooltip.jsx';
import { usePresence } from '../utils/usePresence.js';

/** How long the snackbar stays after a save, and after "Undone". */
const SHOW_MS = 8000;
const DONE_MS = 2500;

/**
 * Admin mode's note at the bottom of the screen after each save: what
 * changed, with an Undo button. It stays while the mouse is over it or it
 * has keyboard focus, and Escape closes it. A new save replaces it, so
 * Undo always means the latest save.
 *
 * Props:
 *   change - { id, message, undo() } from AdminContext, or null
 */
export default function UndoSnackbar({ change }) {
  const [current, setCurrent] = useState(change);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null); // null | 'undoing' | 'undone' | { error }
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // A new save: show it (set while drawing, React's way to follow a prop).
  if (change !== current) {
    setCurrent(change);
    setOpen(Boolean(change));
    setStatus(null);
  }

  const { mounted, visible } = usePresence(open, 200);

  useEffect(() => {
    if (!open || hovered || focused || status === 'undoing') return undefined;
    const timer = setTimeout(() => setOpen(false), status === 'undone' ? DONE_MS : SHOW_MS);
    return () => clearTimeout(timer);
  }, [open, hovered, focused, status, current]);

  async function undo() {
    setStatus('undoing');
    try {
      await current.undo();
      setStatus('undone');
    } catch (error) {
      setStatus({ error: error.message });
    }
  }

  const message =
    status === 'undone' ? `Undone: ${current.message}` : status?.error ? `Couldn't undo: ${status.error}` : current?.message;

  return (
    <>
      {/* Always on the page, so screen readers hear each new message. */}
      <div role="status" aria-live="polite" className="sr-only">
        {open ? message : ''}
      </div>
      {mounted && current && (
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return;
            event.preventDefault(); // Escape is handled here; see AGENTS.md.
            setOpen(false);
          }}
          className={`panel fixed bottom-4 left-1/2 z-40 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center
            gap-3 py-2 pr-2 pl-4 text-sm text-fg shadow-lg transition duration-200 ease-smooth motion-reduce:transition-none
            ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
        >
          <p className={status?.error ? 'text-red-700 dark:text-red-400' : ''}>{message}</p>
          {status !== 'undone' && (
            <button type="button" onClick={undo} disabled={status === 'undoing'} className="button-small disabled:opacity-60">
              {status === 'undoing' ? 'Undoing…' : 'Undo'}
            </button>
          )}
          <Tooltip text="Dismiss">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Dismiss"
              className="rounded-md p-1 text-muted hover:bg-hover hover:text-fg"
            >
              <XMarkIcon className="size-5" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>
      )}
    </>
  );
}
