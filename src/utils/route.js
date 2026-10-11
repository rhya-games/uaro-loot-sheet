import { useEffect, useState } from 'react';

/**
 * Tiny page switcher using the part of the URL after "#":
 *   .../uaro-loot-sheet/            -> "loot" (the item list)
 *   .../uaro-loot-sheet/#/about     -> "about"
 *
 * Hash links are the usual way to have several pages on GitHub Pages, which
 * can only serve files and can't handle real paths like /about on reload.
 *
 * To add a page: add it here, in NAV_LINKS (components/SiteHeader.jsx),
 * and in PAGES (App.jsx). Admin pages go in ADMIN_ROUTES instead (and in
 * src/admin/adminPages.js, which puts them in the admin tab bar).
 */

/** Admin mode's pages (see src/admin/). Only under `npm run dev`; the published site has none. */
const ADMIN_ROUTES = import.meta.env.DEV
  ? {
      admin: '#/admin',
      adminPrices: '#/admin/needs-price',
      adminPaste: '#/admin/paste-prices',
      adminSuggestions: '#/admin/suggestions',
      adminVerify: '#/admin/verify-prices',
      targets: '#/targets',
    }
  : {};

export const ROUTES = {
  loot: '#/',
  about: '#/about',
  feedback: '#/feedback',
  changelog: '#/changelog',
  ...ADMIN_ROUTES,
};

/** The admin pages, so the header can highlight "Admin" on any of them. */
export const isAdminRoute = (route) => route in ADMIN_ROUTES;

/** The page for a hash no route matches (a mistyped or old link). */
export const NOT_FOUND = 'notFound';

function readRoute() {
  // The loot page keeps its search and filters after a "?" (see utils/viewUrl.js).
  const path = window.location.hash.split('?')[0];
  const match = Object.entries(ROUTES).find(([, hash]) => hash === path);
  if (match) return match[0];
  // Only "#/something" is a page address. Anything else ("", "#", a bare
  // "#main" anchor) is the loot page, as it always was.
  return path.startsWith('#/') && path !== '#/' ? NOT_FOUND : 'loot';
}

/** The current page name; updates when the user clicks a link or presses Back. */
export function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onChange = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
