import { useEffect, useState } from 'react';

/**
 * Tiny page switcher using the part of the URL after "#":
 *   .../uaro-loot-sheet/          -> "loot" (the item list)
 *   .../uaro-loot-sheet/#/about   -> "about"
 *
 * Hash links are the usual way to have several pages on GitHub Pages, which
 * can only serve files and can't handle real paths like /about on reload.
 */
export const ROUTES = {
  loot: '#/',
  about: '#/about',
};

function readRoute() {
  return window.location.hash === ROUTES.about ? 'about' : 'loot';
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
