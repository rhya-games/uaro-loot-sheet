import { useEffect } from 'react';
import SkipLink from './components/SkipLink.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import LootPage from './pages/LootPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import ChangelogPage from './pages/ChangelogPage.jsx';
import { useRoute } from './utils/route.js';

/** Every page except the loot page: route name -> title and component. */
const PAGES = {
  about: { title: 'About', Component: AboutPage },
  feedback: { title: 'Feedback', Component: FeedbackPage },
  changelog: { title: 'Changelog', Component: ChangelogPage },
};

/**
 * The page frame: skip link, header, and the current page.
 * The loot page stays mounted (just hidden) while another page is open, so
 * your search, filters and sort are still there when you come back.
 */
export default function App() {
  const route = useRoute();
  const page = PAGES[route];

  useEffect(() => {
    document.title = page ? `${page.title} · uaRO Loot Sheet` : 'uaRO Loot Sheet';
  }, [page]);

  return (
    <div className="min-h-screen bg-page text-body">
      <SkipLink targetId="main" className="focus:fixed focus:top-4 focus:left-4 focus:z-50">
        Skip to main content
      </SkipLink>
      <SiteHeader route={route} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-screen-2xl px-4 py-6 focus:outline-none">
        <div hidden={route !== 'loot'}>
          <LootPage />
        </div>
        {page && <page.Component />}
      </main>
    </div>
  );
}
