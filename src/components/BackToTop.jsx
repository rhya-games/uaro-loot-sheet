import { useEffect, useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip.jsx';
import { goToTop } from '../utils/scroll.js';
import { useFooterLift } from '../utils/useFooterLift.js';

/** Show the button once the page has scrolled this far (about two screens of table). */
const SHOW_AFTER_PX = 1200;
/** Text pages are short, so they get the button much sooner. */
const SHOW_AFTER_PX_TEXT_PAGE = 300;

/**
 * Round "back to top" button in the bottom-right corner. It fades in after
 * scrolling down a good way, and takes you (and keyboard focus) back to the
 * top of the main content. `textPage` shows it after a shorter scroll.
 * `raised` lifts it above the two buttons of FloatingSearchFilters (the loot
 * page): 2 x 44px buttons, 2 x 8px gaps, and the 16px corner room.
 */
export default function BackToTop({ textPage = false, raised = false }) {
  const showAfter = textPage ? SHOW_AFTER_PX_TEXT_PAGE : SHOW_AFTER_PX;
  const [show, setShow] = useState(false);
  const footerLift = useFooterLift();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > showAfter);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [showAfter]);

  return (
    <div
      className={`fixed right-4 ${raised ? 'bottom-[7.5rem]' : 'bottom-4'} z-30 transition-opacity duration-200 ease-smooth motion-reduce:transition-none ${
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      // Rides above the footer at the end of the page, so it never covers its links.
      style={{ transform: `translateY(${-footerLift}px)` }}
      // Hidden from keyboard and screen readers until it shows.
      inert={!show}
    >
      <Tooltip text="Back to top" placement="top">
        <button
          type="button"
          onClick={goToTop}
          aria-label="Back to top"
          // Inverted: dark in light mode, light in dark mode, so it stands out from the page.
          className="flex size-11 items-center justify-center rounded-full border border-fg bg-fg text-surface shadow-md
            hover:opacity-90"
        >
          <ArrowUpIcon className="size-5" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  );
}
