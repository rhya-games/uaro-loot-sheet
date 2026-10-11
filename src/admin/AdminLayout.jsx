import { adminEntries } from './adminPages.js';
import { useQueueCounts } from './useQueueCounts.js';
import { Page, SideNav, SideNavItem } from '../components/Page.jsx';
import { ROUTES, useRoute } from '../utils/route.js';

/**
 * The frame every admin page uses: the admin navigation in a sidebar, then
 * the usual page title and intro. Keeps the tools one click apart, and the
 * navigation in the same place on every page. (The round Back to top button
 * shows on these pages like on any other text page.)
 *
 * Props:
 *   title, intro - as for Page
 */
export default function AdminLayout({ title, intro, children }) {
  return (
    <Page title={title} intro={intro} side={<AdminNav />}>
      {children}
    </Page>
  );
}

/**
 * Links to the overview and every admin tool that has a page, each with how
 * many items are waiting (see useQueueCounts). A sidebar on wide screens;
 * on narrower ones the sidebar is hidden, so the same links show as a row
 * above the page.
 */
function AdminNav() {
  const route = useRoute();
  const counts = useQueueCounts();
  const links = [{ id: 'overview', title: 'Overview', route: 'admin' }, ...adminEntries().filter((entry) => entry.route)];

  return (
    <>
      <SideNav label="Admin" activeKey={route}>
        {links.map((link) => (
          <SideNavItem key={link.id} href={ROUTES[link.route]} active={link.route === route} trailing={counts[link.id]}>
            {link.title}
          </SideNavItem>
        ))}
      </SideNav>
      <ul className="mb-6 flex flex-wrap gap-2 lg:hidden" aria-label="Admin">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={ROUTES[link.route]}
              aria-current={link.route === route ? 'page' : undefined}
              className={`block rounded-lg border px-3 py-1.5 text-sm font-medium ${
                link.route === route
                  ? 'border-accent-line bg-accent-soft text-accent'
                  : 'border-line-strong bg-surface text-body hover:bg-hover'
              }`}
            >
              {link.title}
              {counts[link.id] != null && <span className="ml-1.5 font-normal text-muted tabular-nums">{counts[link.id]}</span>}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
