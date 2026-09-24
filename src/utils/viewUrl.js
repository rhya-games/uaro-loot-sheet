import { ALL_ACTIONS, ALL_CATEGORIES, ALL_ITEM_TYPES } from './labels.js';
import { EMPTY_FILTERS } from './filter.js';
import { SORT_VALUES } from './sort.js';

/**
 * The loot page's "view" (search text, filters, sort) as a link, so a view
 * can be shared or bookmarked:
 *
 *   #/?q=glacial&action=Keep,Vend&category=Official+Hat+Quest&sort=vend-desc
 *
 * Words are short and readable so people can edit links by hand. Values
 * are joined with commas (no filter value contains one) and spaces become "+".
 * What a person keeps items for isn't part of it: that's about them, not
 * the view.
 */

/** Link word -> filter group key, and which values are allowed (null = any). */
const FILTER_PARAMS = {
  action: { key: 'actions', allowed: ALL_ACTIONS },
  type: { key: 'itemTypes', allowed: ALL_ITEM_TYPES },
  category: { key: 'categories', allowed: ALL_CATEGORIES },
  used: { key: 'usedFor', allowed: null },
};

/** Sort key in the code -> word in the link. */
const SORT_NAMES = {
  name: 'name',
  actions: 'action',
  categories: 'category',
  uses: 'uses',
  avgVend: 'vend',
  avgWhobuy: 'whobuy',
  npcSellPrice: 'npc',
  npcBuyable: 'shop',
  lastVerified: 'verified',
};
const SORT_KEYS = Object.fromEntries(Object.entries(SORT_NAMES).map(([key, name]) => [name, key]));

export const EMPTY_VIEW = { query: '', filters: EMPTY_FILTERS, sort: null };

// Spaces as "+", and slot brackets kept as is: "Love+Guard+[1]".
const encode = (value) => encodeURIComponent(value).replace(/%20/g, '+').replace(/%5B/g, '[').replace(/%5D/g, ']');

/** Undoes encode(). null for a broken %-code (a mangled link). */
function decode(text) {
  try {
    return decodeURIComponent(text.replace(/\+/g, ' '));
  } catch {
    return null;
  }
}

/** True for the loot page's hash: "", "#", "#/", or "#/?...". */
export const isLootHash = (hash) => hash === '' || hash === '#' || hash === '#/' || hash.startsWith('#/?');

/** The hash for a view, e.g. "#/?q=glacial". An empty view is just "#/". */
export function viewToHash({ query, filters, sort }) {
  const parts = [];
  if (query.trim()) parts.push(`q=${encode(query.trim())}`);
  for (const [word, { key }] of Object.entries(FILTER_PARAMS)) {
    if (filters[key].length) parts.push(`${word}=${filters[key].map(encode).join(',')}`);
  }
  if (sort) parts.push(`sort=${SORT_NAMES[sort.key]}-${sort.direction}`);
  return parts.length ? `#/?${parts.join('&')}` : '#/';
}

/**
 * The view in a hash, or null when the hash has none (not the loot page, or
 * no "?..." part). Unknown words and values are skipped, so an old or
 * hand-edited link still opens.
 */
export function hashToView(hash) {
  if (!hash.startsWith('#/?')) return null;
  const view = { query: '', filters: { ...EMPTY_FILTERS }, sort: null };
  for (const part of hash.slice(3).split('&')) {
    const [word, text = ''] = part.split('=');
    if (word === 'q') view.query = decode(text) ?? '';
    else if (FILTER_PARAMS[word]) {
      const { key, allowed } = FILTER_PARAMS[word];
      const values = text.split(',').map(decode).filter(Boolean);
      view.filters[key] = [...new Set(values)].filter((value) => !allowed || allowed.includes(value));
    } else if (word === 'sort') {
      const [name, direction] = text.split('-');
      const key = SORT_KEYS[name];
      if (key && SORT_VALUES[key] && (direction === 'asc' || direction === 'desc')) view.sort = { key, direction };
    }
  }
  return view;
}

/**
 * Makes a stored view safe to use (it comes from localStorage, which can
 * hold anything) by putting it through the same checks as a link.
 */
export function cleanView(view) {
  try {
    const filters = Object.fromEntries(
      Object.keys(EMPTY_FILTERS).map((key) => [key, Array.isArray(view.filters?.[key]) ? view.filters[key].map(String) : []]),
    );
    const query = typeof view.query === 'string' ? view.query : '';
    return hashToView(viewToHash({ query, filters, sort: view.sort?.key in SORT_NAMES ? view.sort : null })) ?? EMPTY_VIEW;
  } catch {
    return EMPTY_VIEW;
  }
}
