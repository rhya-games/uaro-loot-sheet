import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import GitHubLink from './GitHubLink.jsx';
import LootBagIcon from './LootBagIcon.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { ROUTES, isAdminRoute } from '../utils/route.js';

/**
 * Links shown at the top right. `route` must match a name in utils/route.js.
 * Admin is only there under `npm run dev`.
 */
const NAV_LINKS = [
  { route: 'loot', label: 'Loot Sheet' },
  { route: 'about', label: 'About' },
  { route: 'feedback', label: 'Feedback' },
  { route: 'changelog', label: 'Changelog' },
  ...(import.meta.env.DEV ? [{ route: 'admin', label: 'Admin' }] : []),
];

/** Which key the shortcut hint shows. */
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * The green bar at the top: site name on the left; page links, a GitHub
 * link and the light/dark toggle on the right.
 *
 * Props:
 *   route        - the current page name, used to highlight its link
 *   onOpenSearch - opens the search popover (also Cmd/Ctrl+K, see App)
 */
export default function SiteHeader({ route, onOpenSearch }) {
  return (
    // Focus rings here are white, with a green gap (see --focus-gap in index.css).
    <header className="bg-header text-white [--focus-gap:var(--header)]">
      {/* Same width rule as <main> in App.jsx, so the edges line up with the page below. */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 px-6 py-5 ${
          route === 'loot' ? '' : 'mx-auto max-w-screen-2xl'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Decorative: the site's loot bag, like the browser tab icon. */}
          <LootBagIcon className="size-12 shrink-0 text-white" />
          <div>
            <a href={ROUTES.loot} className="rounded text-2xl font-bold focus-visible:outline-white">
              Rhya's uaRO Loot Sheet
            </a>
            <p className="mt-1 text-sm text-emerald-100">Quickly determine what to do with your loot.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Site">
            <ul className="flex flex-wrap gap-1">
              {NAV_LINKS.map((link) => {
                // The Admin link stays lit on every admin page.
                const current = link.route === route || (link.route === 'admin' && isAdminRoute(route));
                return (
                  <li key={link.route}>
                    <a
                      href={ROUTES[link.route]}
                      aria-current={current ? 'page' : undefined}
                      // The header is dark green, so the focus ring is white here.
                      className={`block rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap focus-visible:outline-white ${
                        current ? 'bg-header-strong text-white' : 'text-emerald-50 hover:bg-white/10'
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search items"
            aria-keyshortcuts="Control+K Meta+K"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-emerald-50 hover:bg-white/10 focus-visible:outline-white"
          >
            <MagnifyingGlassIcon className="size-5" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-white/30 px-1.5 text-xs text-emerald-100 sm:inline">
              {IS_MAC ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>
          <GitHubLink />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
