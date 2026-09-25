import { createContext, useContext } from 'react';
import loot from '../data/loot.json' with { type: 'json' };

/** Admin mode only exists under `npm run dev` (see AdminContext.jsx). */
export const ADMIN_AVAILABLE = import.meta.env.DEV;

/**
 * The items the site shows. The published site leaves out items still
 * "Not Reviewed" (nobody has checked what they're for), so visitors only see
 * checked data; `npm run dev` shows them so they can be reviewed.
 */
export const SITE_ITEMS = ADMIN_AVAILABLE ? loot : loot.filter((item) => !item.categories.includes('Not Reviewed'));

/** Outside admin mode (and on the published site): off, with the site's items. */
export const AdminContext = createContext({ enabled: false, items: SITE_ITEMS });

/** { available, enabled, setEnabled, items, suggest(item), saveItem(id, changes), targets, saveTarget(name, value) } */
export const useAdmin = () => useContext(AdminContext);
