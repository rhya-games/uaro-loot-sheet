import { useEffect, useMemo, useRef, useState } from 'react';
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

/**
 * The filter panel has three layouts, by window width:
 *   1420px and up: beside the table, pushing it over (open by default).
 *   1024-1419px:   floats over the left of the table, so the table isn't
 *                  squeezed into cards (closed by default).
 *   under 1024px:  full-screen takeover (closed by default).
 *
 * 1420px = table's minimum width (~1100px, see ItemList) + panel (240px)
 * + gap (24px) + page padding (32px), rounded up. The same number appears in
 * the `wide:` classes below; change both together.
 */
const PANEL_BESIDE_TABLE = '(min-width: 1420px)';

/** The main page: search box, filter sidebar, and the item table. */
export default function LootPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const panelBesideTable = useMediaQuery(PANEL_BESIDE_TABLE);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia(PANEL_BESIDE_TABLE).matches);
  const toggleButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [sort, setSort] = useState(null);
  const [ignoreKeep, setIgnoreKeep] = useState(() => readPreference('ignoreKeep', false));

  // "I don't keep items" changes the items themselves (no Keep), so every
  // count, chip and sort below sees the same thing the table shows.
  const baseItems = useMemo(() => (ignoreKeep ? withoutKeep(loot) : loot), [ignoreKeep]);

  const changeIgnoreKeep = (value) => {
    setIgnoreKeep(value);
    writePreference('ignoreKeep', value);
    if (value) setFilters((current) => ({ ...current, actions: current.actions.filter((a) => a !== 'Keep') }));
  };

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

  const closePanel = () => {
    setSidebarOpen(false);
    toggleButtonRef.current?.focus();
  };

  // Full-screen panel on small screens: stop the page behind it from scrolling.
  const smallScreen = useMediaQuery('(max-width: 1023px)');
  useEffect(() => {
    if (!(sidebarOpen && smallScreen)) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, smallScreen]);

  // Clicking a "Used For" target shows only items used for that target.
  const showItemsUsedFor = (target) => {
    setFilters({ ...EMPTY_FILTERS, usedFor: [target] });
    setQuery('');
    setSidebarOpen(true);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Loot items</h1>
      <div className="flex gap-3">
        {/* Small screens: filter icon only (with tooltip). Larger: icon and text. */}
        <Tooltip text={sidebarOpen ? 'Hide filters' : 'Show filters'} placement="bottom">
          <button
            ref={toggleButtonRef}
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-expanded={sidebarOpen}
            aria-controls="filter-sidebar"
            aria-label={sidebarOpen ? 'Hide filters' : 'Show filters'}
            className="flex h-full shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm
              font-medium text-gray-700 shadow-sm hover:bg-gray-100 lg:px-4"
          >
            <FunnelIcon className="size-5" aria-hidden="true" />
            <span className="hidden lg:inline">{sidebarOpen ? 'Hide filters' : 'Show filters'}</span>
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
        <p className="text-sm text-gray-500">
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
          until 1420px (`wide:`), where the grid gets a second column and the panel sits beside it. */}
      <div
        className={`lg:grid lg:items-start ${sidebarOpen ? 'wide:grid-cols-[15rem_minmax(0,1fr)] wide:gap-6' : ''}`}
      >
        {sidebarOpen && (
          <aside
            id="filter-sidebar"
            aria-label="Filters"
            onKeyDown={(event) => event.key === 'Escape' && !panelBesideTable && closePanel()}
            className="fixed inset-0 z-50 overflow-y-auto bg-white px-4 pb-4
              lg:panel lg:sticky lg:inset-auto lg:top-4 lg:z-30 lg:col-start-1 lg:row-start-1 lg:max-h-[calc(100vh-2rem)]
              lg:w-60 lg:justify-self-start lg:pb-3 lg:shadow-xl wide:shadow-sm"
          >
            <div className="hidden lg:block">
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
              onClear={() => setFilters(EMPTY_FILTERS)}
            />
          </aside>
        )}
        <div
          id="results"
          tabIndex={-1}
          className={`min-w-0 focus:outline-none lg:col-start-1 lg:row-start-1 ${sidebarOpen ? 'wide:col-start-2' : ''}`}
        >
          <ItemList
            items={results}
            sort={sort}
            onSort={(key) => setSort((current) => nextSort(current, key))}
            onSelectUse={showItemsUsedFor}
          />
        </div>
      </div>
    </div>
  );
}
