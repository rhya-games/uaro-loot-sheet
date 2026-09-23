import { useMemo, useState } from 'react';
import loot from '../data/loot.json';
import SearchBar from '../components/SearchBar.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import ActiveFilters from '../components/ActiveFilters.jsx';
import ItemList from '../components/ItemList.jsx';
import SkipLink from '../components/SkipLink.jsx';
import { createSearch } from '../utils/search.js';
import { nextSort, sortItems } from '../utils/sort.js';
import { EMPTY_FILTERS, countActiveFilters, filterItems, toggleValue, withoutKeep } from '../utils/filter.js';
import { readPreference, writePreference } from '../utils/preferences.js';

/** The main page: search box, filter sidebar, and the item table. */
export default function LootPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-expanded={sidebarOpen}
          aria-controls="filter-sidebar"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium
            text-gray-700 shadow-sm hover:bg-gray-100"
        >
          {sidebarOpen ? 'Hide filters' : 'Show filters'}
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs text-white">{activeFilterCount}</span>
          )}
        </button>
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

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {sidebarOpen && (
          <aside
            id="filter-sidebar"
            aria-label="Filters"
            className="panel relative px-4 py-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]
              lg:w-60 lg:shrink-0 lg:overflow-y-auto"
          >
            <SkipLink targetId="results" className="focus:absolute focus:top-2 focus:left-2 focus:z-20">
              Skip to table
            </SkipLink>
            <FilterSidebar
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
        <div id="results" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
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
