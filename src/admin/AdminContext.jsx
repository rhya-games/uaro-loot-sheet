import { useCallback, useMemo, useRef, useState } from 'react';
import { ADMIN_AVAILABLE, AdminContext, SITE_ITEMS } from './useAdmin.js';
import { createSuggester, TARGET_VALUES } from '../utils/suggest.js';
import { readPreference, writePreference } from '../utils/preferences.js';
import UndoSnackbar from './UndoSnackbar.jsx';

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
 *
 * Every save remembers what it changed (including actions it updated on
 * other items), and a snackbar offers to undo the latest one.
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

/** The fields a save can change, so undo can put them all back. */
const SAVED_FIELDS = ['avgVend', 'avgWhobuy', 'lastVerified', 'verificationNotes', 'actions'];
const savedFields = (item) => Object.fromEntries(SAVED_FIELDS.map((field) => [field, item[field]]));

/** A price as the snackbar says it: 12000 -> "12,000z", 0 -> "None", null -> "no price". */
const priceText = (zeny) => (zeny == null ? 'no price' : zeny === 0 ? 'None' : `${zeny.toLocaleString('en-US')}z`);
const FIELD_NAMES = { avgVend: 'Vend', avgWhobuy: 'Whobuy' };

/** " · actions updated on 2 items", or nothing. */
const actionsNote = (count) => (count ? ` · actions updated on ${count} item${count === 1 ? '' : 's'}` : '');

export function AdminProvider({ children }) {
  const [enabled, setEnabled] = useState(() => ADMIN_AVAILABLE && readPreference('admin', false));
  const [items, setItems] = useState(SITE_ITEMS);
  // What "Used For" targets are worth (use-targets.json), with this session's edits.
  const [targets, setTargets] = useState(TARGET_VALUES);

  // The latest items and targets, for saves that finish one after another
  // (tabbing from Vend to Whobuy saves twice in a row).
  const latest = useRef(items);
  const latestTargets = useRef(targets);
  // The latest save, for the undo snackbar: { id, message, undo() }.
  const [lastChange, setLastChange] = useState(null);

  /**
   * Swaps a saved item into `items`. With `before`, remembers the item as it
   * was before this save started (once per item), so it can be undone.
   */
  const replaceItem = useCallback((saved, before) => {
    if (before && !before.has(saved.id)) before.set(saved.id, latest.current.find((item) => item.id === saved.id));
    latest.current = latest.current.map((item) => (item.id === saved.id ? saved : item));
    setItems(latest.current);
    return saved;
  }, []);

  /** Saves a target's value (null removes it) and updates `targets`. */
  const writeTarget = useCallback(async (target, value) => {
    await postTarget(target, value);
    const next = new Map(latestTargets.current);
    if (value == null) next.delete(target);
    else next.set(target, value);
    latestTargets.current = next;
    setTargets(next);
  }, []);

  /** Puts back items as they were (their saved fields only), without suggesting anything. */
  const restoreItems = useCallback(async (before) => {
    for (const [id, old] of before) replaceItem(await postItem(id, savedFields(old)));
  }, [replaceItem]);

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
    const before = new Map();
    const replace = (saved) => replaceItem(saved, before);
    const saved = replace(await postItem(id, changes));
    if ('avgVend' in changes || 'avgWhobuy' in changes) await applySuggestion(saved, replace);

    const old = before.get(id);
    const prices = Object.keys(FIELD_NAMES).filter((field) => field in changes);
    const what = prices.length
      ? prices.map((field) => `${FIELD_NAMES[field]} ${priceText(old[field])} → ${priceText(changes[field])}`).join(', ')
      : 'saved';
    const actionsChanged = !sameActions(old.actions, latest.current.find((item) => item.id === id).actions);
    setLastChange({
      id: Date.now(),
      message: `${saved.name}: ${what}${prices.length && actionsChanged ? ' · actions updated' : ''}`,
      undo: () => restoreItems(before),
    });
  }, [applySuggestion, replaceItem, restoreItems]);

  /**
   * Saves what a "Used For" target is worth, then updates the actions of
   * everything used to make it, the same way saving a price does.
   */
  const saveTarget = useCallback(async (target, value) => {
    const oldValue = latestTargets.current.get(target) ?? null;
    await writeTarget(target, value);
    const before = new Map();
    const parts = latest.current.filter((item) => item.uses.some((use) => use.for === target));
    for (const part of parts) await applySuggestion(part, (saved) => replaceItem(saved, before));
    setLastChange({
      id: Date.now(),
      message: `${target}: ${priceText(oldValue)} → ${priceText(value)}${actionsNote(before.size)}`,
      undo: async () => {
        await writeTarget(target, oldValue);
        await restoreItems(before);
      },
    });
  }, [applySuggestion, replaceItem, restoreItems, writeTarget]);

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
  return (
    <AdminContext.Provider value={value}>
      {children}
      {ADMIN_AVAILABLE && <UndoSnackbar change={lastChange} />}
    </AdminContext.Provider>
  );
}
