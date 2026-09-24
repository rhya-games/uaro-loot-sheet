import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import loot from '../data/loot.json';
import SearchBar from '../components/SearchBar.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import ActiveFilters from '../components/ActiveFilters.jsx';
import ItemList from '../components/ItemList.jsx';
import SkipLink from '../components/SkipLink.jsx';
import Tooltip from '../components/Tooltip.jsx';
import { createSearch } from '../utils/search.js';
import { nextSort, sortItems } from '../utils/sort.js';
import { EMPTY_FILTERS, countActiveFilters, filterItems, toggleValue, withoutKeep } from '../utils/filter.js';
import { readPreference, writePreference } from '../utils/preferences.js';
import { useMediaQuery } from '../utils/useMediaQuery.js';

/** How long the panel takes to slide in or out (ms). Matches `duration-200` below. */
const PANEL_ANIMATION_MS = 200;

/**
 * The filter panel has three layouts, by window width:
 *   1470px and up: beside the table, pushing it over (open by default).
 *   768-1469px:    floats over the left of the table, so the table isn't
 *                  squeezed (closed by default).
 *   under 768px:   a sheet covering most of the screen, with a dimmed strip
 *                  (scrim) on the right; clicking the scrim closes it
 *                  (closed by default).
 *
 * 1470px is the `wide` breakpoint in index.css (table width + panel + gap +
 * padding). The same number is in PANEL_BESIDE_TABLE below; change both together.
 */
const PANEL_BESIDE_TABLE = '(min-width: 1470px)';

/** The main page: search box, filter sidebar, and the item table. */
export default function LootPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const panelBesideTable = useMediaQuery(PANEL_BESIDE_TABLE);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia(PANEL_BESIDE_TABLE).matches);
  const toggleButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const resultsRef = useRef(null);
  const resultsLeftBefore = useRef(null);
  const [sort, setSort] = useState(null);
  const [ignoreKeep, setIgnoreKeep] = useState(() => readPreference('ignoreKeep', false));

  // "I don't keep items" changes the items themselves (no Keep), so every
  // count, chip and sort below sees the same thing the table shows.
  const baseItems = useMemo(() => (ignoreKeep ? withoutKeep(loot) : loot), [ignoreKeep]);

  const changeIgnoreKeep = useCallback((value) => {
    setIgnoreKeep(value);
    writePreference('ignoreKeep', value);
    if (value) setFilters((current) => ({ ...current, actions: current.actions.filter((a) => a !== 'Keep') }));
  }, []);

  // Build the search index, then: search box, then sidebar filters, then sorting.
  const search = useMemo(() => createSearch(baseItems), [baseItems]);
  const searched = useMemo(() => search(query), [search, query]);
  const results = useMemo(() => sortItems(filterItems(searched, filters), sort), [searched, filters, sort]);

  const activeFilterCount = countActiveFilters(filters) + (ignoreKeep ? 1 : 0);

  // When the panel floats or takes over the screen, opening it moves focus into
  // it, and closing it returns focus to the toggle button.
  const panelCovers = sidebarOpen && !panelBesideTable;
  useEffect(() => {
    if (panelCovers) closeButtonRef.current?.focus();
  }, [panelCovers]);

  /** Opens or closes the panel. Remembers where the table was, for the slide below. */
  const changePanel = useCallback((open) => {
    resultsLeftBefore.current = resultsRef.current?.getBoundingClientRect().left ?? null;
    setSidebarOpen(open);
  }, []);

  const closePanel = useCallback(() => {
    changePanel(false);
    toggleButtonRef.current?.focus();
  }, [changePanel]);

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  // On wide screens the panel pushes the table over. Instead of animating the
  // table's width (which re-lays-out every row on every frame and stutters),
  // the layout changes in one step and the table *slides* from where it was to
  // where it is now. This is the "FLIP" technique: First, Last, Invert, Play.
  const panelTakesSpace = sidebarOpen;
  useLayoutEffect(() => {
    const before = resultsLeftBefore.current;
    resultsLeftBefore.current = null;
    const results = resultsRef.current;
    if (before == null || !results) return;
    const distance = before - results.getBoundingClientRect().left;
    if (distance === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    results.animate([{ transform: `translateX(${distance}px)` }, { transform: 'translateX(0)' }], {
      duration: PANEL_ANIMATION_MS,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // same as `ease-smooth` in index.css
    });
  }, [panelTakesSpace]);

  // Escape closes the panel whenever it's covering the table, wherever focus
  // is. Things that use Escape themselves first (clearing the search box,
  // hiding a tooltip, closing a menu) mark the key as handled, so it's skipped.
  useEffect(() => {
    if (!panelCovers) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !event.defaultPrevented) closePanel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [panelCovers]);

  // Sheet on small screens: stop the page behind it from scrolling.
  const smallScreen = useMediaQuery('(max-width: 767px)');
  useEffect(() => {
    if (!(sidebarOpen && smallScreen)) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, smallScreen]);

  // Clicking a "Used For" target shows only items used for that target.
  // (The filter chips above the table show it; the panel stays as it was.)
  // useCallback keeps these the same function between renders, so the item
  // list (which is memoized) doesn't redraw for unrelated changes.
  const showItemsUsedFor = useCallback((target) => {
    setFilters({ ...EMPTY_FILTERS, usedFor: [target] });
    setQuery('');
    window.scrollTo({ top: 0 });
  }, []);
  const changeSort = useCallback((key) => setSort((current) => nextSort(current, key)), []);

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Loot items</h1>
      <div className="flex gap-3">
        {/* Small screens: filter icon only (with tooltip). Larger: icon and text. */}
        <Tooltip text={sidebarOpen ? 'Hide filters' : 'Show filters'} placement="bottom">
          <button
            ref={toggleButtonRef}
            type="button"
            onClick={() => changePanel(!sidebarOpen)}
            aria-expanded={sidebarOpen}
            aria-controls="filter-sidebar"
            aria-label={sidebarOpen ? 'Hide filters' : 'Show filters'}
            className="flex h-full shrink-0 items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-sm
              font-medium text-body shadow-sm hover:bg-hover md:justify-center md:px-4"
          >
            <FunnelIcon className="size-5" aria-hidden="true" />
            {/* Both labels share one grid cell, so the button is always as wide as the
                longer one and doesn't change size when the label switches. */}
            <span className="hidden md:grid">
              {['Show filters', 'Hide filters'].map((label) => (
                <span
                  key={label}
                  aria-hidden="true"
                  className={`col-start-1 row-start-1 ${(label === 'Hide filters') === sidebarOpen ? '' : 'invisible'}`}
                >
                  {label}
                </span>
              ))}
            </span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs text-white">{activeFilterCount}</span>
            )}
          </button>
        </Tooltip>
        <div className="flex-1">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm text-subtle-fg">
          Showing {results.length} of {loot.length} items
        </p>
        <ActiveFilters
          query={query}
          filters={filters}
          ignoreKeep={ignoreKeep}
          onClearQuery={() => setQuery('')}
          onClearIgnoreKeep={() => changeIgnoreKeep(false)}
          onRemove={(key, value) => setFilters({ ...filters, [key]: toggleValue(filters[key], value) })}
          onRemoveGroup={(key) => setFilters({ ...filters, [key]: [] })}
          onClearAll={() => {
            setQuery('');
            setFilters(EMPTY_FILTERS);
            changeIgnoreKeep(false);
          }}
        />
      </div>

      {/* Panel and table share one grid cell (so the panel floats over the table)
          until 1470px (`wide:`), where the grid gets a second column for the panel.
          overflow-x-clip hides the table's edge while it slides (see the FLIP effect above)
          without breaking the sticky header; the clip margin keeps the panel's shadow. */}
      <div
        className={`md:grid md:items-start wide:overflow-x-clip wide:[overflow-clip-margin:1rem] ${
          panelTakesSpace ? 'wide:grid-cols-[15rem_minmax(0,1fr)] wide:gap-6' : ''
        }`}
      >
        {/* The panel and scrim are always on the page; closing just hides them.
            Building the panel's ~250 checkboxes on every open was a big part of
            the delay, so now opening and closing only switch a few classes.
            `inert` makes the closed panel unreachable (no Tab, no screen reader).
            Visibility turns on instantly when opening (so focus can move in), and
            only turns off after the fade-out when closing: that's why `visibility`
            is in the transition list only for the closed state. */}

        {/* Small screens only: dims the page behind the sheet; clicking it closes the panel. */}
        <div
          aria-hidden="true"
          onClick={closePanel}
          className={`fixed inset-0 z-40 cursor-pointer bg-black/50 duration-200 ease-smooth
            motion-reduce:transition-none md:hidden dark:bg-black/70 ${
              sidebarOpen
                ? 'visible opacity-100 transition-opacity'
                : 'pointer-events-none invisible opacity-0 transition-[opacity,visibility]'
            }`}
        />
        <aside
          id="filter-sidebar"
          aria-label="Filters"
          inert={!sidebarOpen}
          // Slides and fades in from the left, and back out when closed
          // (instant when the system asks for reduced motion).
          className={`fixed inset-y-0 right-12 left-0 z-50 overflow-y-auto bg-surface px-4 pb-4 shadow-xl
            duration-200 ease-smooth motion-reduce:transition-none ${
              sidebarOpen
                ? 'visible translate-x-0 opacity-100 transition-[opacity,translate]'
                : 'pointer-events-none invisible -translate-x-4 opacity-0 transition-[opacity,translate,visibility]'
            }
            md:panel md:sticky md:inset-auto md:top-4 md:z-30 md:col-start-1 md:row-start-1 md:max-h-[calc(100vh-2rem)]
            md:w-60 md:justify-self-start md:pb-3 md:shadow-xl wide:shadow-sm`}
        >
          <div className="hidden md:block">
            <SkipLink targetId="results" className="focus:absolute focus:top-2 focus:left-2 focus:z-20">
              Skip to table
            </SkipLink>
          </div>
          <FilterSidebar
            onClose={panelBesideTable ? undefined : closePanel}
            closeButtonRef={closeButtonRef}
            allItems={baseItems}
            ignoreKeep={ignoreKeep}
            onIgnoreKeepChange={changeIgnoreKeep}
            items={searched}
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
          />
        </aside>
        <div
          ref={resultsRef}
          id="results"
          tabIndex={-1}
          className={`min-w-0 focus:outline-none md:col-start-1 md:row-start-1 ${panelTakesSpace ? 'wide:col-start-2' : ''}`}
        >
          <ItemList
            items={results}
            sort={sort}
            onSort={changeSort}
            onSelectUse={showItemsUsedFor}
          />
        </div>
      </div>
    </div>
  );
}
