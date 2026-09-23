import { useEffect } from 'react';
import SkipLink from './components/SkipLink.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import LootPage from './pages/LootPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import { useRoute } from './utils/route.js';

const PAGE_TITLES = {
  loot: 'uaRO Loot Sheet',
  about: 'About · uaRO Loot Sheet',
};

/**
 * The page frame: skip link, header, and the current page.
 * The loot page stays mounted (just hidden) while About is open, so your
 * search, filters and sort are still there when you come back.
 */
export default function App() {
  const route = useRoute();

  useEffect(() => {
    document.title = PAGE_TITLES[route];
  }, [route]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink targetId="main" className="focus:fixed focus:top-4 focus:left-4 focus:z-50">
        Skip to main content
      </SkipLink>
      <SiteHeader route={route} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-screen-2xl px-4 py-6 focus:outline-none">
        <div hidden={route !== 'loot'}>
          <LootPage />
        </div>
        {route === 'about' && <AboutPage />}
      </main>
    </div>
  );
}
