import { Page, PageLink } from '../components/Page.jsx';
import { ROUTES } from '../utils/route.js';

/** Shown for an address that isn't a page (a mistyped or outdated link). */
export default function NotFoundPage() {
  return (
    <Page title="Page not found" intro="This address doesn't lead to a page on this site.">
      <p>
        Go back to the <PageLink href={ROUTES.loot}>Loot Sheet</PageLink>, or read the{' '}
        <PageLink href={ROUTES.about}>About</PageLink> page.
      </p>
    </Page>
  );
}
