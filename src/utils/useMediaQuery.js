import { useEffect, useState } from 'react';

/**
 * True while a CSS media query matches, e.g. useMediaQuery('(min-width: 1420px)').
 * Updates when the window is resized.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
