import { createContext, useContext } from 'react';
import reviewedData from '../data/reviewed-suggestions.json' with { type: 'json' };

/** Admin mode only exists under `npm run dev` (see AdminContext.jsx). */
export const ADMIN_AVAILABLE = import.meta.env.DEV;

/** What the page has before the items arrive. */
export const NO_ITEMS = [];

let itemsPromise = null;

/**
 * Loads loot.json as its own file, so the page draws (header, search box)
 * while the data downloads, and the browser can keep the data apart from the
 * code. main.jsx calls this before React starts, so the download begins at
 * once; the first call starts it and later calls share the answer.
 *
 * The published site leaves out items still "Not Reviewed" (nobody has
 * checked what they're for), so visitors only see checked data; `npm run
 * dev` shows them so they can be reviewed.
 *
 * No `with { type: 'json' }` here, unlike the other JSON imports: Vite's
 * dev server rejects it on a dynamic import, and Vite reads JSON by itself.
 */
export function loadItems() {
  itemsPromise ??= import('../data/loot.json').then(({ default: loot }) =>
    ADMIN_AVAILABLE ? loot : loot.filter((item) => !item.categories.includes('Not Reviewed')),
  );
  return itemsPromise;
}

/**
 * The "Keep mine" reviews (reviewed-suggestions.json) as a Map of item id ->
 * { id, name, actions, suggested }. Empty on the published site, which drops the file.
 */
export const REVIEWED = new Map(ADMIN_AVAILABLE ? reviewedData.items.map((entry) => [entry.id, entry]) : []);

/** Outside admin mode (and on the published site): off, with the site's items. */
export const AdminContext = createContext({ enabled: false, items: NO_ITEMS, status: 'loading' });

/**
 * { available, enabled, setEnabled, items, status ('loading' | 'ready' | 'failed'), suggest(item), saveItem(id, changes, description),
 *   saveItems([{ id, changes }], description, onProgress), targets, saveTarget(name, value), reviewed, saveReviewed(item, suggested), removeReviewed(item) }
 */
export const useAdmin = () => useContext(AdminContext);
