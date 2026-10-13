import { createContext, useContext } from 'react';
import reviewedData from '../data/reviewed-suggestions.json' with { type: 'json' };

/** Admin mode only exists under `npm run dev` (see AdminContext.jsx). */
export const ADMIN_AVAILABLE = import.meta.env.DEV;

/** What the page has before the items arrive. */
export const NO_ITEMS = [];

let itemsPromise = null;
let privatePromise = null;

/** What the private data is when there is none (the published site, or no file on this computer). */
const NO_PRIVATE = { prices: {}, targets: [] };

/** An item with nothing known about its price (what the private file says when it has no entry). */
const NO_PRICE = { avgVend: null, lastVerified: null, verificationNotes: '' };

/**
 * The private data from the dev server: { prices, targets } (see
 * scripts/private-data.mjs). Vend prices and target values are not part of
 * the repo, so they only exist on the computer that runs `npm run dev`.
 * Outside it, and when the request fails, there's nothing.
 */
export function loadPrivate() {
  privatePromise ??= ADMIN_AVAILABLE
    ? fetch(`${import.meta.env.BASE_URL}__admin/private`)
        .then((response) => (response.ok ? response.json() : NO_PRIVATE))
        .catch(() => NO_PRIVATE)
    : Promise.resolve(NO_PRIVATE);
  return privatePromise;
}

/**
 * Loads loot.json as its own file, so the page draws (header, search box)
 * while the data downloads, and the browser can keep the data apart from the
 * code. main.jsx calls this before React starts, so the download begins at
 * once; the first call starts it and later calls share the answer.
 *
 * Under `npm run dev` the private prices are added to each item (avgVend,
 * lastVerified, verificationNotes; see loadPrivate). The published site only
 * has the stored `vend` result.
 *
 * The published site leaves out items still "Not Reviewed" (nobody has
 * checked what they're for), so visitors only see checked data; `npm run
 * dev` shows them so they can be reviewed.
 *
 * No `with { type: 'json' }` here, unlike the other JSON imports: Vite's
 * dev server rejects it on a dynamic import, and Vite reads JSON by itself.
 */
export function loadItems() {
  itemsPromise ??= Promise.all([import('../data/loot.json'), loadPrivate()]).then(([{ default: loot }, { prices }]) =>
    ADMIN_AVAILABLE
      ? loot.map((item) => ({ ...item, ...NO_PRICE, ...prices[item.id] }))
      : loot.filter((item) => !item.categories.includes('Not Reviewed')),
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
