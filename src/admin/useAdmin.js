import { createContext, useContext } from 'react';
import loot from '../data/loot.json' with { type: 'json' };
import reviewedData from '../data/reviewed-suggestions.json' with { type: 'json' };

/** Admin mode only exists under `npm run dev` (see AdminContext.jsx). */
export const ADMIN_AVAILABLE = import.meta.env.DEV;

/**
 * The items the site shows. The published site leaves out items still
 * "Not Reviewed" (nobody has checked what they're for), so visitors only see
 * checked data; `npm run dev` shows them so they can be reviewed.
 */
export const SITE_ITEMS = ADMIN_AVAILABLE ? loot : loot.filter((item) => !item.categories.includes('Not Reviewed'));

/**
 * The "Keep mine" reviews (reviewed-suggestions.json) as a Map of item id ->
 * { id, name, actions, suggested }. Empty on the published site, which drops the file.
 */
export const REVIEWED = new Map(ADMIN_AVAILABLE ? reviewedData.items.map((entry) => [entry.id, entry]) : []);

/** Outside admin mode (and on the published site): off, with the site's items. */
export const AdminContext = createContext({ enabled: false, items: SITE_ITEMS });

/**
 * { available, enabled, setEnabled, items, suggest(item), saveItem(id, changes, description),
 *   targets, saveTarget(name, value), reviewed, saveReviewed(item, suggested), removeReviewed(item) }
 */
export const useAdmin = () => useContext(AdminContext);
