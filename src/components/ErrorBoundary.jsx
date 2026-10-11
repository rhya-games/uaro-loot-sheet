import { Component } from 'react';
import { GENERAL_ISSUE_URL } from '../config.js';

/**
 * Catches an error thrown while drawing and shows a plain message instead of
 * a blank page. It wraps the whole app (see main.jsx), so the message stands
 * alone: it can't use the site header or anything else that might be broken.
 * React only supports this as a class component.
 *
 * Props:
 *   children - the app
 */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Keep the details in the console, for a bug report.
    console.error(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-6 text-body">
        <div role="alert" className="panel max-w-md space-y-3 p-6 text-center">
          <h1 className="text-xl font-semibold text-fg">Something went wrong</h1>
          <p>The page ran into a problem and couldn’t be shown. Reloading usually fixes it.</p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <button type="button" className="button-small" onClick={() => window.location.reload()}>
              Reload
            </button>
            <a href={GENERAL_ISSUE_URL} target="_blank" rel="noopener noreferrer" className="button-small">
              Report the problem
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
}
