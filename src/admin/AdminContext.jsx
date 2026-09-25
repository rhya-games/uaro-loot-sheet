import { useCallback, useMemo, useRef, useState } from 'react';
import { ADMIN_AVAILABLE, AdminContext, SITE_ITEMS } from './useAdmin.js';
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
 * The context and the useAdmin() hook live in useAdmin.js (so this file
 * only exports a component, which keeps editing it smooth under `npm run dev`).
 * The table reads admin state from this context instead of props, so the
 * memo'd item list doesn't need new props to show or hide the editors.
 * The loot page reads `items` from here too (on the published site it's
 * just loot.json).
 */
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
  const [items, setItems] = useState(SITE_ITEMS);

  // The latest items, for saves that finish one after another (tabbing from
  // Vend to Whobuy saves twice in a row).
  const latest = useRef(items);

  /**
   * Saves changes to one item. When a price changes, the actions its new
   * prices suggest are saved too, replacing the old ones, so entering prices
   * is all it takes to keep actions up to date.
   */
  const saveItem = useCallback(async (id, changes) => {
    const replace = (saved) => {
      latest.current = latest.current.map((item) => (item.id === id ? saved : item));
      setItems(latest.current);
      return saved;
    };
    const saved = replace(await postItem(id, changes));
    if ('avgVend' in changes || 'avgWhobuy' in changes) {
      const { actions } = createSuggester(latest.current)(saved);
      const same = actions.length === saved.actions.length && actions.every((action) => saved.actions.includes(action));
      if (actions.length && !same) replace(await postItem(id, { actions }));
    }
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
