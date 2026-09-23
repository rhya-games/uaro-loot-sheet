import { useMemo, useState } from 'react';
import loot from './data/loot.json';
import SearchBar from './components/SearchBar.jsx';
import ItemList from './components/ItemList.jsx';
import { createSearch } from './utils/search.js';

export default function App() {
  const [query, setQuery] = useState('');

  // Build the search index once, then re-run it whenever the text changes.
  const search = useMemo(() => createSearch(loot), []);
  const results = useMemo(() => search(query), [search, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-800 text-white">
        <div className="mx-auto max-w-screen-2xl px-4 py-5">
          <h1 className="text-2xl font-bold">Rhya's uaRO Loot Sheet</h1>
          <p className="mt-1 text-sm text-emerald-100">Quickly determine what to do with your loot.</p>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl space-y-4 px-4 py-6">
        <SearchBar value={query} onChange={setQuery} />
        <p className="text-sm text-gray-500">
          Showing {results.length} of {loot.length} items
        </p>
        <ItemList items={results} />
      </main>
    </div>
  );
}
