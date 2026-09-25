import { UMAMI_WEBSITE_ID } from '../config.js';
import { IN_DEV } from './labels.js';

/**
 * Visit and usage counts, sent to Umami (https://umami.is): which pages
 * people open, what they search for, which filters they use, and so on.
 * Umami uses no cookies and stores nothing about the person, so the site
 * needs no consent banner.
 *
 * Nothing is sent under `npm run dev`, when UMAMI_WEBSITE_ID (config.js) is
 * null, or when an ad blocker stops Umami's script. Every call here is safe
 * in all of those cases: it just does nothing.
 *
 * Umami can't see page changes on its own: pages are "#/about" links, and
 * the loot page changes its link with replaceState (see LootPage.jsx). So
 * App.jsx reports page views itself, and the rest are named events.
 *
 * To not count your own visits, run this once in the browser console:
 *   localStorage.setItem('umami.disabled', 1)
 */

const SCRIPT_URL = 'https://cloud.umami.is/script.js';
const ENABLED = !IN_DEV && Boolean(UMAMI_WEBSITE_ID);

/** Longest text sent in one property (search text, item names). */
const MAX_TEXT = 100;

// Calls made before Umami's script has loaded wait here. null once it has
// failed to load (blocked), so nothing piles up.
let waiting = [];

function send(call) {
  if (!ENABLED || waiting === null) return;
  if (window.umami) {
    try {
      call(window.umami);
    } catch {
      // Analytics must never break the page.
    }
  } else if (waiting.length < 50) {
    waiting.push(call);
  }
}

const shorten = (value) => (typeof value === 'string' ? value.slice(0, MAX_TEXT) : value);

/**
 * Records one event, like track('search', { q: 'glacial', results: 3 }).
 * Property values should be short strings or numbers.
 */
export function track(name, props) {
  const data = props && Object.fromEntries(Object.entries(props).map(([key, value]) => [key, shorten(value)]));
  send((umami) => (data ? umami.track(name, data) : umami.track(name)));
}

/** Records a page view, e.g. trackPage('about') counts as "/about". */
export function trackPage(route) {
  const url = route === 'loot' ? '/' : `/${route}`;
  send((umami) => umami.track((props) => ({ ...props, url, title: document.title })));
}

/**
 * Link clicks. A link with `data-track="name"` sends that event, with any
 * other `data-track-*` attributes as properties (`data-track-item="Apple"`
 * sends { item: 'Apple' }). Other links to other sites send "outbound" with
 * the address (without its ?query, which can be long).
 */
function onLinkClick(event) {
  if (event.type === 'auxclick' && event.button !== 1) return; // only the middle button opens links
  const link = event.target.closest?.('a[href]');
  if (!link) return;
  const { track: name, ...rest } = link.dataset;
  if (name) {
    const props = Object.fromEntries(
      Object.entries(rest)
        .filter(([key]) => key.startsWith('track'))
        .map(([key, value]) => [key.slice(5).toLowerCase(), value]),
    );
    track(name, props);
  } else if (link.host && link.host !== window.location.host) {
    track('outbound', { url: link.host + link.pathname });
  }
}

/** Loads Umami's script and starts watching link clicks. Call once, at start. */
export function startAnalytics() {
  if (!ENABLED) return;
  const script = document.createElement('script');
  script.src = SCRIPT_URL;
  script.defer = true;
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  // Page views are sent by trackPage instead (see above).
  script.dataset.autoTrack = 'false';
  script.onload = () => {
    const calls = waiting ?? [];
    waiting = [];
    calls.forEach(send);
  };
  script.onerror = () => {
    waiting = null;
  };
  document.head.append(script);
  // "click" misses middle-clicks (open in a new tab); "auxclick" catches them.
  document.addEventListener('click', onLinkClick, true);
  document.addEventListener('auxclick', onLinkClick, true);
}
