import { useMemo, useState } from 'react';
import loot from './data/loot.json';
import SearchBar from './components/SearchBar.jsx';
import FilterSidebar from './components/FilterSidebar.jsx';
import ItemList from './components/ItemList.jsx';
import { createSearch } from './utils/search.js';
import { EMPTY_FILTERS, countActiveFilters, filterItems } from './utils/filter.js';

export default function App() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Build the search index once, then: search box first, sidebar filters second.
  const search = useMemo(() => createSearch(loot), []);
  const searched = useMemo(() => search(query), [search, query]);
  const results = useMemo(() => filterItems(searched, filters), [searched, filters]);

  const activeFilterCount = countActiveFilters(filters);

  // Clicking a "Used For" target shows only items used for that target.
  const showItemsUsedFor = (target) => {
    setFilters({ ...EMPTY_FILTERS, usedFor: [target] });
    setQuery('');
    setSidebarOpen(true);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-800 text-white">
        <div className="mx-auto max-w-screen-2xl px-4 py-5">
          <h1 className="text-2xl font-bold">Rhya's uaRO Loot Sheet</h1>
          <p className="mt-1 text-sm text-emerald-100">Quickly determine what to do with your loot.</p>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl space-y-4 px-4 py-6">
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

        <p className="text-sm text-gray-500">
          Showing {results.length} of {loot.length} items
        </p>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {sidebarOpen && (
            <aside
              id="filter-sidebar"
              className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]
                lg:w-64 lg:shrink-0 lg:overflow-y-auto"
            >
              <FilterSidebar
                allItems={loot}
                items={searched}
                filters={filters}
                onChange={setFilters}
                onClear={() => setFilters(EMPTY_FILTERS)}
              />
            </aside>
          )}
          <div className="min-w-0 flex-1">
            <ItemList items={results} onSelectUse={showItemsUsedFor} />
          </div>
        </div>
      </main>
    </div>
  );
}
