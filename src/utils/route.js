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
 * and in PAGES (App.jsx).
 */
export const ROUTES = {
  loot: '#/',
  about: '#/about',
  feedback: '#/feedback',
  changelog: '#/changelog',
  // Admin mode's target values; only under `npm run dev` (see admin/TargetsPage.jsx).
  ...(import.meta.env.DEV && { targets: '#/targets' }),
};

function readRoute() {
  // The loot page keeps its search and filters after a "?" (see utils/viewUrl.js).
  const path = window.location.hash.split('?')[0];
  const match = Object.entries(ROUTES).find(([, hash]) => hash === path);
  return match ? match[0] : 'loot';
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
