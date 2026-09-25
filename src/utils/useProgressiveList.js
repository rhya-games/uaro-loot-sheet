import { useEffect, useState } from 'react';

/** Rows drawn right away when the list grows. */
const FIRST_BATCH = 60;
/** Rows added per step after that. */
const BATCH = 200;

/**
 * Draws a long list in batches when it grows, so the page stays responsive.
 * Clearing the search turns ~30 rows back into ~1,100, and drawing all the new
 * rows at once froze the page for a moment. Now the first rows show at once
 * and the rest follow a batch at a time, each after the browser has had a
 * chance to paint and handle typing.
 *
 * Rows already on the page stay: a list that only shrinks or reorders (typing
 * more letters, sorting) keeps everything drawn and adds nothing.
 *
 * Returns the part of `items` to draw right now.
 */
export function useProgressiveList(items) {
  // The first load starts with one batch too, so the page appears sooner.
  const [state, setState] = useState({ items, count: FIRST_BATCH });

  // A new list: keep as many rows as were drawn before (they're mostly the
  // same rows), but at least the first batch. Set during render, React's
  // pattern for state that follows a prop.
  let { count } = state;
  if (state.items !== items) {
    count = Math.max(FIRST_BATCH, Math.min(state.count, items.length));
    setState({ items, count });
  }

  useEffect(() => {
    if (count >= items.length) return undefined;
    const timer = setTimeout(() => {
      setState((current) => (current.items === items ? { items, count: current.count + BATCH } : current));
    }, 0);
    return () => clearTimeout(timer);
  }, [items, count]);

  return count >= items.length ? items : items.slice(0, count);
}
