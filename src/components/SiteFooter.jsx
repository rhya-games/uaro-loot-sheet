import { GitHubIcon } from './GitHubLink.jsx';
import { GITHUB_REPO_URL } from '../config.js';

/**
 * The note at the very bottom of every page: who made the site and where
 * the code lives. App.jsx pushes it to the bottom of the window when a page
 * is shorter than the screen.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div
        className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 text-sm
          text-muted"
      >
        <p>Made by Rhya for the uaRO community.</p>
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
