import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import loot from '../data/loot.json' with { type: 'json' };
import { createSuggester } from '../utils/suggest.js';
import { readPreference, writePreference } from '../utils/preferences.js';

/**
 * Admin mode: edit prices in the table and see suggested actions.
 *
 * It only exists while running `npm run dev`. Saving goes to the dev
 * server (scripts/admin-server.mjs), which writes src/data/loot.json, and
 * the saved item replaces the old one in `items` here, so the page keeps
 * its search, filters and scroll position. The published site has no
 * server, so ADMIN_AVAILABLE is false there and none of this shows.
 *
 * The table reads admin state from this context instead of props, so the
 * memo'd item list doesn't need new props to show or hide the editors.
 * The loot page reads `items` from here too (on the published site it's
 * just loot.json).
 */
export const ADMIN_AVAILABLE = import.meta.env.DEV;

const AdminContext = createContext({ enabled: false, items: loot });

/** Sends one item's changes to the dev server and returns the saved item. Throws on failure. */
async function postItem(id, changes) {
  const response = await fetch(`${import.meta.env.BASE_URL}__admin/item`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, changes }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? `Save failed (${response.status})`);
  return result.item;
}

export function AdminProvider({ children }) {
  const [enabled, setEnabled] = useState(() => ADMIN_AVAILABLE && readPreference('admin', false));
  const [items, setItems] = useState(loot);

  const saveItem = useCallback(async (id, changes) => {
    const saved = await postItem(id, changes);
    setItems((current) => current.map((item) => (item.id === id ? saved : item)));
  }, []);

  const changeEnabled = useCallback((value) => {
    setEnabled(value);
    writePreference('admin', value);
  }, []);

  // Rebuilt after each save, so suggestions see the new prices.
  const suggest = useMemo(() => createSuggester(items), [items]);

  const value = useMemo(
    () => ({ available: ADMIN_AVAILABLE, enabled, setEnabled: changeEnabled, items, suggest, saveItem }),
    [enabled, changeEnabled, items, suggest, saveItem],
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

/** { available, enabled, setEnabled, items, suggest(item), saveItem(id, changes) } */
export const useAdmin = () => useContext(AdminContext);
