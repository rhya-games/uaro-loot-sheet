import { useCallback, useEffect, useState } from 'react';
import SkipLink from './components/SkipLink.jsx';
import BackToTop from './components/BackToTop.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SearchPalette from './components/SearchPalette.jsx';
import WelcomeDialog from './components/WelcomeDialog.jsx';
import LootPage from './pages/LootPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import ChangelogPage from './pages/ChangelogPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { NOT_FOUND, useRoute } from './utils/route.js';
import { readPreference, writePreference } from './utils/preferences.js';
import { trackPage } from './utils/analytics.js';
import { isPaletteShortcut } from './utils/shortcut.js';
import { AdminProvider } from './admin/AdminContext.jsx';
import { ADMIN_AVAILABLE, useAdmin } from './admin/useAdmin.js';
import AdminOverviewPage from './admin/AdminOverviewPage.jsx';
import NeedsPricePage from './admin/NeedsPricePage.jsx';
import PastePricesPage from './admin/PastePricesPage.jsx';
import SuggestionsPage from './admin/SuggestionsPage.jsx';
import VerifyPricesPage from './admin/VerifyPricesPage.jsx';
import TargetsPage from './admin/TargetsPage.jsx';

/** Every page except the loot page: route name -> title and component. */
const PAGES = {
  about: { title: 'About', Component: AboutPage },
  feedback: { title: 'Feedback', Component: FeedbackPage },
  changelog: { title: 'Changelog', Component: ChangelogPage },
  [NOT_FOUND]: { title: 'Page not found', Component: NotFoundPage },
  ...(ADMIN_AVAILABLE && {
    admin: { title: 'Admin', Component: AdminOverviewPage },
    adminPrices: { title: 'Needs a price', Component: NeedsPricePage },
    adminPaste: { title: 'Paste prices', Component: PastePricesPage },
    adminSuggestions: { title: 'Suggestion differs', Component: SuggestionsPage },
    adminVerify: { title: 'Verify prices', Component: VerifyPricesPage },
    targets: { title: 'Target values', Component: TargetsPage },
  }),
};

/** The search popover with the items the site shows (admin mode's edited ones, under `npm run dev`). */
function AppSearch({ open, onClose }) {
  const { items, status } = useAdmin();
  return <SearchPalette open={open} onClose={onClose} items={items} status={status} />;
}

/**
 * The page frame: skip link, header, and the current page.
 * The loot page stays mounted (just hidden) while another page is open, so
 * your search, filters and sort are still there when you come back.
 */
export default function App() {
  const route = useRoute();
  const page = PAGES[route];

  // The welcome box opens by itself, once, on a first visit to the loot page.
  const [welcomeOpen, setWelcomeOpen] = useState(() => route === 'loot' && !readPreference('welcomeSeen', false));
  const closeWelcome = useCallback(() => {
    writePreference('welcomeSeen', true);
    setWelcomeOpen(false);
  }, []);

  // Cmd/Ctrl+K opens the search popover from any page (not over the welcome box).
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!isPaletteShortcut(event)) return;
      event.preventDefault(); // Browsers use Ctrl+K for their own search.
      if (!welcomeOpen) setSearchOpen((open) => !open);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [welcomeOpen]);

  useEffect(() => {
    document.title = page ? `${page.title} · uaRO Loot Sheet` : 'uaRO Loot Sheet';
  }, [page]);
  // After the title effect above, so the view is counted with the new title.
  useEffect(() => trackPage(route), [route]);

  return (
    // A column as tall as the window: the footer sits at the bottom of the
    // window on short pages, and after the content on long ones.
    <AdminProvider>
      <div className="flex min-h-screen flex-col bg-page text-body">
        <SkipLink targetId="main" className="focus:fixed focus:top-4 focus:left-4 focus:z-50">
          Skip to main content
        </SkipLink>
        <SiteHeader route={route} onOpenSearch={openSearch} />
        {/* The loot page lets its table use the whole window width; the text pages keep a readable width. */}
        <main
          id="main"
          tabIndex={-1}
          className={`w-full flex-1 px-6 py-6 focus:outline-none ${route === 'loot' ? '' : 'mx-auto max-w-screen-2xl'}`}
        >
          <div hidden={route !== 'loot'}>
            <LootPage onOpenSearch={openSearch} />
          </div>
          {page && <page.Component />}
        </main>
        <SiteFooter route={route} />
        <WelcomeDialog open={welcomeOpen} onClose={closeWelcome} />
        <AppSearch open={searchOpen} onClose={closeSearch} />
        <BackToTop textPage={route !== 'loot'} raised={route === 'loot'} />
      </div>
    </AdminProvider>
  );
}
