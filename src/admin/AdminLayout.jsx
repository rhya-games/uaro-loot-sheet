import { adminEntries } from './adminPages.js';
import { useQueueCounts } from './useQueueCounts.js';
import { Page } from '../components/Page.jsx';
import { ROUTES, useRoute } from '../utils/route.js';

/**
 * The frame every admin page uses: the admin navigation on top, then the
 * usual page title and intro. Keeps the tools one click apart, and the
 * navigation in the same place on every page.
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
    </>
  );
}

/**
 * Links to the overview and every admin tool that has a page, each with how
 * many items are waiting (see useQueueCounts), and a way back to the loot sheet.
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
        <li className="ml-auto">
          <a href={ROUTES.loot} className="block rounded-lg px-3 py-1.5 text-sm text-muted hover:text-fg">
            Loot sheet
          </a>
        </li>
      </ul>
    </nav>
  );
}
