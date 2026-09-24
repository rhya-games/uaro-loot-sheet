import { GitHubIcon } from './GitHubLink.jsx';
import { GITHUB_REPO_URL } from '../config.js';
import { CHANGELOG } from '../data/changelog.js';
import { ROUTES } from '../utils/route.js';

/**
 * The note at the very bottom of every page: who made the site, its version
 * (the newest changelog entry), and where the code lives. App.jsx pushes it
 * to the bottom of the window when a page is shorter than the screen.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div
        className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 text-sm
          text-muted"
      >
        <p>
          Made by Rhya for the uaRO community.{' '}
          <a href={ROUTES.changelog} className="rounded hover:underline">
            Version {CHANGELOG[0].version}
          </a>
        </p>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded text-accent hover:underline"
        >
          <GitHubIcon className="size-4" />
          Open source on GitHub
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </footer>
  );
}
