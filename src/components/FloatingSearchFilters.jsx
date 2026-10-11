import { useEffect, useState } from 'react';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip.jsx';
import { goToTop } from '../utils/scroll.js';

/**
 * Show the buttons once the page has scrolled past the toolbar (the search
 * box and Filters button at the top of the loot page). Well before the Back
 * to top button, which sits right above them (see BackToTop's `raised`).
 */
const SHOW_AFTER_PX = 200;

/** The look of the round buttons: the same size as Back to top, but not inverted. */
const ROUND_BUTTON =
  'relative flex size-11 items-center justify-center rounded-full border border-line-strong bg-surface text-body shadow-md hover:bg-hover';

/**
 * Two round buttons in the bottom-right corner of the loot page, so you can
 * change the search or filters without scrolling back up: Filters opens (or
 * closes) the filter panel, and Search takes you to the top with the cursor
 * in the search box. They fade in after scrolling past the toolbar.
 *
 * Props:
 *   filtersOpen  - whether the filter panel is open
 *   activeCount  - how many filters are on (shown as a badge)
 *   onFilters    - toggles the filter panel
 */
export default function FloatingSearchFilters({ filtersOpen, activeCount, onFilters }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const search = () => {
    goToTop();
    // Smooth scrolling is under way: don't let focusing the box jump the page.
    document.getElementById('search')?.focus({ preventScroll: true });
  };

  return (
    <div
      className={`fixed right-4 bottom-4 z-30 flex flex-col gap-2 transition-opacity duration-200 ease-smooth motion-reduce:transition-none ${
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      // Hidden from keyboard and screen readers until it shows.
      inert={!show}
    >
      <Tooltip text={filtersOpen ? 'Hide filters' : 'Show filters'} placement="top">
        <button
          type="button"
          onClick={onFilters}
          aria-expanded={filtersOpen}
          aria-controls="filter-sidebar"
          aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}
          className={ROUND_BUTTON}
        >
          <FunnelIcon className="size-5" aria-hidden="true" />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 rounded-full bg-control px-1.5 py-0.5 text-xs leading-none text-white">
              {activeCount}
            </span>
          )}
        </button>
      </Tooltip>
      <Tooltip text="Search" placement="top">
        <button type="button" onClick={search} aria-label="Search items" className={ROUND_BUTTON}>
          <MagnifyingGlassIcon className="size-5" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  );
}
