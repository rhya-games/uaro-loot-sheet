import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import SearchBar from '../components/SearchBar.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import ActiveFilters from '../components/ActiveFilters.jsx';
import ItemList from '../components/ItemList.jsx';
import SkipLink from '../components/SkipLink.jsx';
import ShareButton from '../components/ShareButton.jsx';
import AdminToggle from '../admin/AdminToggle.jsx';
import Tooltip from '../components/Tooltip.jsx';
import { createSearch, wordMatcher } from '../utils/search.js';
import { nextSort, sortItems } from '../utils/sort.js';
import { EMPTY_FILTERS, countActiveFilters, filterItems, toggleValue } from '../utils/filter.js';
import { ALL_ACTIVITY_IDS, keepOnlyFor, keepsEverything } from '../utils/activities.js';
import { readPreference, writePreference } from '../utils/preferences.js';
import { useMediaQuery } from '../utils/useMediaQuery.js';
import { useAdmin } from '../admin/AdminContext.jsx';
import { EMPTY_VIEW, cleanView, hashToView, isLootHash, viewToHash } from '../utils/viewUrl.js';


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

/** The look of the buttons beside the search box (Filters, Share), so they match. */
const TOOLBAR_BUTTON =
  'flex shrink-0 items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium text-body shadow-sm hover:bg-hover md:justify-center md:px-4';

/**
 * The view to start with: the one in the link if there is one, otherwise
 * the last one this browser used, otherwise nothing.
 */
function startingView() {
  return hashToView(window.location.hash) ?? cleanView(readPreference('lastView', EMPTY_VIEW));
}

/** The main page: search box, filter sidebar, and the item table. */
export default function LootPage() {
  const [start] = useState(startingView);
  const [query, setQuery] = useState(start.query);
  const [filters, setFilters] = useState(start.filters);
  const panelBesideTable = useMediaQuery(PANEL_BESIDE_TABLE);
  // Beside the table, the panel remembers whether it was open. Where it
  // covers the table, it always starts closed.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.matchMedia(PANEL_BESIDE_TABLE).matches && readPreference('panelOpen', true),
  );
  const toggleButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const resultsRef = useRef(null);
  const resultsLeftBefore = useRef(null);
  const [sort, setSort] = useState(start.sort);
  // What the player keeps items for (hats, pets, ...). Everything by default.
  // Older visits saved "I don't keep items" instead; that means nothing picked.
  const [keepForSetting, setKeepFor] = useState(
    () => readPreference('keepFor', null) ?? (readPreference('ignoreKeep', false) ? [] : ALL_ACTIVITY_IDS),
  );
  // loot.json, plus any prices saved in admin mode since the page loaded.
  const { items: loot, enabled: adminOn } = useAdmin();
  // Admin mode needs the real actions (to compare with suggestions), so it
  // shows everything. The player's setting is remembered for afterwards.
  const keepFor = adminOn ? ALL_ACTIVITY_IDS : keepForSetting;

  // This changes the items themselves (Keep removed where it doesn't apply),
  // so every count, chip and sort below sees the same thing the table shows.
  const baseItems = useMemo(() => keepOnlyFor(loot, keepFor), [loot, keepFor]);

  const changeKeepFor = useCallback((activityIds) => {
    setKeepFor(activityIds);
    writePreference('keepFor', activityIds);
  }, []);

  /** Clear all: every filter, and back to keeping items for everything. The search stays. */
  const clearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    changeKeepFor(ALL_ACTIVITY_IDS);
  }, [changeKeepFor]);

  // Build the search index, then: search box, then sidebar filters, then sorting.
  const search = useMemo(() => createSearch(baseItems), [baseItems]);
  // The search box shows each letter right away; the list catches up a moment
  // later (React can drop an unfinished redraw when the next letter arrives).
  const deferredQuery = useDeferredValue(query);
  const searched = useMemo(() => search(deferredQuery), [search, deferredQuery]);
  // Filters work the same way: the checkbox ticks at once, the table follows.
  const deferredFilters = useDeferredValue(filters);
  const results = useMemo(
    () => sortItems(filterItems(searched, deferredFilters), sort),
    [searched, deferredFilters, sort],
  );

  // Which "Used For" entries to bring to the front of each item's list: the
  // targets filtered by, and uses the search text matches as whole words
  // (searching "Headset" puts "x1 Headset" first on Coal). See ItemUses.
  const highlightUses = useMemo(
    () => ({ targets: filters.usedFor, matchesSearch: wordMatcher(deferredQuery) }),
    [filters.usedFor, deferredQuery],
  );

  const activeFilterCount = countActiveFilters(filters) + (keepsEverything(keepFor) ? 0 : 1);

  // The filter panel's counts (~500 checkboxes) follow the search. While the
  // panel is closed nobody sees them, so it keeps what it last showed and
  // skips redrawing on every keystroke; it catches up when it opens.
  const panelView = useRef({ searched, count: results.length });
  if (sidebarOpen) panelView.current = { searched, count: results.length };

  // Keep the link in step with the view, so it can be copied or bookmarked,
  // and remember the view for next time. replaceState changes the address
  // without adding a Back step for every letter typed. Other pages' links
  // (#/about) are left alone.
  const viewHash = viewToHash({ query, filters, sort });
  useEffect(() => {
    writePreference('lastView', { query, filters, sort });
    const syncLink = () => {
      const current = window.location.hash;
      if (!isLootHash(current) || current === viewHash) return;
      if (viewHash === '#/' && !current.startsWith('#/?')) return; // "" and "#/" are the same page
      window.history.replaceState(null, '', viewHash);
    };
    syncLink();
    // Coming back to the loot page (the "Loot Sheet" link is plain "#/")
    // puts the view back in the link. Opening a link with a view in it
    // switches to that view.
    const onHashChange = () => {
      const linked = hashToView(window.location.hash);
      if (linked && viewToHash(linked) !== viewHash) {
        setQuery(linked.query);
        setFilters(linked.filters);
        setSort(linked.sort);
      } else {
        syncLink();
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [viewHash]);

  // When the panel floats or takes over the screen, opening it moves focus into
  // it, and closing it returns focus to the toggle button. Beside the table,
  // opening it from the Filters button does too, since that button disappears.
  const panelCovers = sidebarOpen && !panelBesideTable;
  const focusCloseOnOpen = useRef(false);
  useEffect(() => {
    if (panelCovers || (sidebarOpen && focusCloseOnOpen.current)) closeButtonRef.current?.focus();
    focusCloseOnOpen.current = false;
  }, [panelCovers, sidebarOpen]);

  /** Opens or closes the panel. Remembers where the table was, for the slide below. */
  const changePanel = useCallback((open) => {
    resultsLeftBefore.current = resultsRef.current?.getBoundingClientRect().left ?? null;
    setSidebarOpen(open);
    if (window.matchMedia(PANEL_BESIDE_TABLE).matches) writePreference('panelOpen', open);
  }, []);

  // Closing returns focus to the Filters button. Beside the table that button
  // only appears once the panel is closed, so focus moves after the redraw.
  const focusToggleOnClose = useRef(false);
  const closePanel = useCallback(() => {
    focusToggleOnClose.current = true;
    changePanel(false);
  }, [changePanel]);
  useEffect(() => {
    if (sidebarOpen || !focusToggleOnClose.current) return;
    focusToggleOnClose.current = false;
    toggleButtonRef.current?.focus();
  }, [sidebarOpen]);


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


  const filtersButton = (
    <button
      ref={toggleButtonRef}
      type="button"
      onClick={() => {
        focusCloseOnOpen.current = !sidebarOpen;
        changePanel(!sidebarOpen);
      }}
      aria-expanded={sidebarOpen}
      aria-controls="filter-sidebar"
      aria-label={sidebarOpen ? 'Hide filters' : 'Show filters'}
      className={TOOLBAR_BUTTON}
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
        <span className="rounded-full bg-control px-2 py-0.5 text-xs text-white">{activeFilterCount}</span>
      )}
    </button>
  );
  // Wide screens with the panel open: the panel has its own close button, so
  // the toolbar drops the Filters button and the search box takes its room.
  const panelShownBeside = sidebarOpen && panelBesideTable;
  const showFiltersButton = !panelShownBeside;

  const toolbar = (
    <>
      <div className="flex gap-3">
        {/* Small screens: filter icon only, so it gets a tooltip. Larger: icon and text (no tooltip needed). */}
        {showFiltersButton &&
          (smallScreen ? (
            <Tooltip text={sidebarOpen ? 'Hide filters' : 'Show filters'} placement="bottom">
              {filtersButton}
            </Tooltip>
          ) : (
            filtersButton
          ))}
        <div className="flex-1">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        {smallScreen ? (
          <Tooltip text="Share" placement="bottom">
            <ShareButton iconOnly className={TOOLBAR_BUTTON} />
          </Tooltip>
        ) : (
          <ShareButton className={TOOLBAR_BUTTON} />
        )}
        <AdminToggle className={TOOLBAR_BUTTON} />
      </div>

      {/* The results header: how many items, and what's narrowing them. Always one
          chip tall, so adding the first filter doesn't push the table down. When the
          panel sits beside the table it shows the count and filters itself, so this hides. */}
      {!panelShownBeside && (
        <div className="flex min-h-7 flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm text-muted" aria-live="polite">
            {results.length.toLocaleString('en-US')} of {loot.length.toLocaleString('en-US')} items
          </p>
          <ActiveFilters
            filters={filters}
            keepFor={keepFor}
            onClearKeepFor={() => changeKeepFor(ALL_ACTIVITY_IDS)}
            onRemove={(key, value) => setFilters({ ...filters, [key]: toggleValue(filters[key], value) })}
            onRemoveGroup={(key) => setFilters({ ...filters, [key]: [] })}
            onClearAll={clearAll}
          />
        </div>
      )}
    </>
  );

  return (
    <div>
      <h1 className="sr-only">Loot items</h1>

      {/* Panel and table share one grid cell (so the panel floats over the table)
          until 1470px (`wide:`), where the grid gets a second column for the panel.
          overflow-x-clip hides the table's edge while it slides (see the FLIP effect above)
          without breaking the sticky header. Browsers ignore overflow-clip-margin when
          only one direction clips, so -mx-4/px-4 widen the clip box instead: that room
          keeps focus rings and the panel's shadow at the edges from being cut off. */}
      <div
        className={`md:grid md:items-start wide:-mx-4 wide:overflow-x-clip wide:px-4 ${
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
              Skip to results
            </SkipLink>
          </div>
          <FilterSidebar
            onClose={closePanel}
            resultCount={panelView.current.count}
            totalCount={loot.length}
            activeCount={activeFilterCount}
            onClearAll={clearAll}
            closeButtonRef={closeButtonRef}
            allItems={baseItems}
            keepFor={keepFor}
            keepForDisabled={adminOn}
            onKeepForChange={changeKeepFor}
            items={panelView.current.searched}
            filters={filters}
            onChange={setFilters}
          />
        </aside>
        <div
          ref={resultsRef}
          id="results"
          tabIndex={-1}
          className={`min-w-0 space-y-4 focus:outline-none md:col-start-1 md:row-start-1 ${panelTakesSpace ? 'wide:col-start-2' : ''}`}
        >
          {toolbar}
          <ItemList
            items={results}
            sort={sort}
            onSort={changeSort}
            onSelectUse={showItemsUsedFor}
            highlightUses={highlightUses}
          />
        </div>
      </div>
    </div>
  );
}
