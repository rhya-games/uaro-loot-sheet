import { useCallback, useMemo, useRef, useState } from 'react';
import { ADMIN_AVAILABLE, AdminContext, SITE_ITEMS } from './useAdmin.js';
import { createSuggester, TARGET_VALUES } from '../utils/suggest.js';
import { readPreference, writePreference } from '../utils/preferences.js';

/**
 * Admin mode: edit prices in the table and see suggested actions.
 *
 * It only exists while running `npm run dev`. Saving goes to the dev
 * server (scripts/admin-server.mjs), which writes src/data/loot.json, and
 * the saved item replaces the old one in `items` here, so the page keeps
 * its search, filters and scroll position. The published site has no
 * server, so ADMIN_AVAILABLE is false there and none of this shows.
 *
 * The context and the useAdmin() hook live in useAdmin.js (so this file
 * only exports a component, which keeps editing it smooth under `npm run dev`).
 * The table reads admin state from this context instead of props, so the
 * memo'd item list doesn't need new props to show or hide the editors.
 * The loot page reads `items` from here too (on the published site it's
 * just loot.json).
 */
/** Sends one item's changes to the dev server and returns the saved item. Throws on failure. */
async function postItem(id, changes) {
  const response = await fetch(`${import.meta.env.BASE_URL}__admin/item`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, changes }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? `Save failed (${response.status})`);
  return result.item;
}

/** Saves what a "Used For" target is worth (null removes it). Throws on failure. */
async function postTarget(target, value) {
  const response = await fetch(`${import.meta.env.BASE_URL}__admin/target`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ for: target, value }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? `Save failed (${response.status})`);
}

const sameActions = (a, b) => a.length === b.length && a.every((action) => b.includes(action));

export function AdminProvider({ children }) {
  const [enabled, setEnabled] = useState(() => ADMIN_AVAILABLE && readPreference('admin', false));
  const [items, setItems] = useState(SITE_ITEMS);
  // What "Used For" targets are worth (use-targets.json), with this session's edits.
  const [targets, setTargets] = useState(TARGET_VALUES);

  // The latest items and targets, for saves that finish one after another
  // (tabbing from Vend to Whobuy saves twice in a row).
  const latest = useRef(items);
  const latestTargets = useRef(targets);

  /**
   * Saves the actions an item's prices now suggest, if they changed. Items
   * with no player price yet keep their hand-set actions: the suggestion
   * can't tell how to sell them, so it would drop Vend or NPC.
   */
  const applySuggestion = useCallback(async (item, replace) => {
    const { actions, sale } = createSuggester(latest.current, latestTargets.current)(item);
    if (sale && actions.length && !sameActions(actions, item.actions)) replace(await postItem(item.id, { actions }));
  }, []);

  /**
   * Saves changes to one item. When a price changes, the actions its new
   * prices suggest are saved too, replacing the old ones, so entering prices
   * is all it takes to keep actions up to date.
   */
  const saveItem = useCallback(async (id, changes) => {
    const replace = (saved) => {
      latest.current = latest.current.map((item) => (item.id === id ? saved : item));
      setItems(latest.current);
      return saved;
    };
    const saved = replace(await postItem(id, changes));
    if ('avgVend' in changes || 'avgWhobuy' in changes) await applySuggestion(saved, replace);
  }, [applySuggestion]);

  /**
   * Saves what a "Used For" target is worth, then updates the actions of
   * everything used to make it, the same way saving a price does.
   */
  const saveTarget = useCallback(async (target, value) => {
    await postTarget(target, value);
    const next = new Map(latestTargets.current);
    if (value == null) next.delete(target);
    else next.set(target, value);
    latestTargets.current = next;
    setTargets(next);
    const parts = latest.current.filter((item) => item.uses.some((use) => use.for === target));
    for (const part of parts) {
      await applySuggestion(part, (saved) => {
        latest.current = latest.current.map((item) => (item.id === saved.id ? saved : item));
        setItems(latest.current);
      });
    }
  }, [applySuggestion]);

  const changeEnabled = useCallback((value) => {
    setEnabled(value);
    writePreference('admin', value);
  }, []);

  // Rebuilt after each save, so suggestions see the new prices.
  const suggest = useMemo(() => createSuggester(items, targets), [items, targets]);

  const value = useMemo(
    () => ({ available: ADMIN_AVAILABLE, enabled, setEnabled: changeEnabled, items, suggest, saveItem, targets, saveTarget }),
    [enabled, changeEnabled, items, suggest, saveItem, targets, saveTarget],
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
