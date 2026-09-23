import { ROUTES } from '../utils/route.js';

/** Links shown at the top right. `route` must match a name in utils/route.js. */
const NAV_LINKS = [
  { route: 'loot', label: 'Loot Sheet' },
  { route: 'about', label: 'About' },
];

/**
 * The green bar at the top: site name on the left, page links on the right.
 *
 * Props:
 *   route - the current page name, used to highlight its link
 */
export default function SiteHeader({ route }) {
  return (
    <header className="bg-emerald-800 text-white">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4 px-4 py-5">
        <div>
          <a href={ROUTES.loot} className="rounded text-2xl font-bold focus-visible:outline-white">
            Rhya's uaRO Loot Sheet
          </a>
          <p className="mt-1 text-sm text-emerald-100">Quickly determine what to do with your loot.</p>
        </div>

        <nav aria-label="Site">
          <ul className="flex gap-1">
            {NAV_LINKS.map((link) => {
              const current = link.route === route;
              return (
                <li key={link.route}>
                  <a
                    href={ROUTES[link.route]}
                    aria-current={current ? 'page' : undefined}
                    // The header is dark green, so the focus ring is white here.
                    className={`block rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-white ${
                      current ? 'bg-emerald-900 text-white' : 'text-emerald-50 hover:bg-emerald-700'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
