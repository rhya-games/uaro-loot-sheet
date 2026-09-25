import { createContext, useContext } from 'react';
import loot from '../data/loot.json' with { type: 'json' };

/** Admin mode only exists under `npm run dev` (see AdminContext.jsx). */
export const ADMIN_AVAILABLE = import.meta.env.DEV;

/** Outside admin mode (and on the published site): off, with loot.json as the items. */
export const AdminContext = createContext({ enabled: false, items: loot });

/** { available, enabled, setEnabled, items, suggest(item), saveItem(id, changes) } */
export const useAdmin = () => useContext(AdminContext);
