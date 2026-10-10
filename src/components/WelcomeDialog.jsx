import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import HowToSteps from './HowToSteps.jsx';
import { ROUTES } from '../utils/route.js';

/**
 * The "how to use this" box. It opens by itself on a first visit to the loot
 * page (see App), and again from the header's "How to use" button.
 *
 * It's a native <dialog> opened with showModal(), so the browser keeps Tab
 * inside it, dims and disables the page behind it, and returns focus to
 * where you were when it closes.
 *
 * Props:
 *   open    - whether the box is showing
 *   onClose - called when it should close (button, X, Escape, or a click outside)
 */
export default function WelcomeDialog({ open, onClose }) {
  const ref = useRef(null);
  const gotItRef = useRef(null);

  // The dialog element's own open state follows `open`. Focus goes to "Got it"
  // (showModal would pick the close button, which is first in the box).
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      gotItRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="welcome-title"
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault(); // Escape is handled here; see AGENTS.md.
        onClose();
      }}
      // Also covers closing without the keyboard (for example, Android's back gesture).
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A click on the dimmed area lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="panel m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto p-0 text-body backdrop:bg-black/50"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="welcome-title" className="text-xl font-semibold text-fg">
            Welcome to Rhya’s Loot Sheet
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-hover"
          >
            <XMarkIcon className="size-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">Look up an item to see what to do with it.</p>

        <div className="mt-5">
          <HowToSteps />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line-faint pt-4">
          <a href={ROUTES.about} onClick={onClose} className="rounded text-sm text-accent hover:underline">
            More on the About page
          </a>
          <button
            ref={gotItRef}
            type="button"
            onClick={onClose}
            className="rounded-lg bg-control px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Got it
          </button>
        </div>
      </div>
    </dialog>
  );
}
