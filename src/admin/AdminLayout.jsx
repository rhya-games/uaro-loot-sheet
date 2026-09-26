import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { adminEntries } from './adminPages.js';
import { useQueueCounts } from './useQueueCounts.js';
import { Page } from '../components/Page.jsx';
import { ROUTES, useRoute } from '../utils/route.js';
import { goToTop } from '../utils/scroll.js';

/**
 * The frame every admin page uses: the admin navigation on top, then the
 * usual page title and intro, and a Back to top button at the bottom (the
 * lists are long, and the round button only shows after a lot of scrolling).
 * Keeps the tools one click apart, and the navigation in the same place on
 * every page.
 *
 * Props:
 *   title, intro - as for Page
 */
export default function AdminLayout({ title, intro, children }) {
  return (
    <>
      <AdminNav />
      <Page title={title} intro={intro}>
        {children}
      </Page>
      <div className="mx-auto mt-6 flex max-w-3xl justify-end">
        <button type="button" onClick={goToTop} className="button-small inline-flex items-center gap-1.5">
          <ArrowUpIcon className="size-4" aria-hidden="true" />
          Back to top
        </button>
      </div>
    </>
  );
}

/**
 * Links to the overview and every admin tool that has a page, each with how
 * many items are waiting (see useQueueCounts).
 */
function AdminNav() {
  const route = useRoute();
  const counts = useQueueCounts();
  const links = [{ id: 'overview', title: 'Overview', route: 'admin' }, ...adminEntries().filter((entry) => entry.route)];

  return (
    <nav aria-label="Admin" className="mx-auto mb-6 max-w-3xl">
      <ul className="flex flex-wrap items-center gap-2">
        {links.map((link) => {
          const current = link.route === route;
          return (
            <li key={link.id}>
              <a
                href={ROUTES[link.route]}
                aria-current={current ? 'page' : undefined}
                className={`block rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  current ? 'border-accent-line bg-accent-soft text-accent' : 'border-line-strong bg-surface text-body hover:bg-hover'
                }`}
              >
                {link.title}
                {counts[link.id] != null && <span className="ml-1.5 font-normal text-muted tabular-nums">{counts[link.id]}</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
