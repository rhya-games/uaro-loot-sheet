import { useEffect, useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip.jsx';

/** Show the button once the page has scrolled this far (about two screens of table). */
const SHOW_AFTER_PX = 1200;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Round "back to top" button in the bottom-right corner. It fades in after
 * scrolling down a good way, and takes you (and keyboard focus) back to the
 * top of the main content.
 */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    // Keyboard users continue from the top too, not from the button.
    document.getElementById('main')?.focus({ preventScroll: true });
  };

  return (
    <div
      className={`fixed right-4 bottom-4 z-30 transition-opacity duration-200 ease-smooth motion-reduce:transition-none ${
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      // Hidden from keyboard and screen readers until it shows.
      inert={!show}
    >
      <Tooltip text="Back to top" placement="top">
        <button
          type="button"
          onClick={goToTop}
          aria-label="Back to top"
          className="flex size-11 items-center justify-center rounded-full border border-line bg-surface text-body shadow-md
            hover:bg-hover"
        >
          <ArrowUpIcon className="size-5" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  );
}
