// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function draw(element) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(element));
  return container;
}

function Broken() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('shows the app when nothing fails', () => {
    const view = draw(
      <ErrorBoundary>
        <p>All fine</p>
      </ErrorBoundary>,
    );
    expect(view.textContent).toBe('All fine');
  });

  it('shows a message with a way out when drawing fails', () => {
    // React and the boundary both log the error; keep the test output clean.
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const view = draw(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    log.mockRestore();
    expect(view.querySelector('[role="alert"] h1').textContent).toBe('Something went wrong');
    expect(view.querySelector('button').textContent).toBe('Reload');
    expect(view.querySelector('a').href).toMatch(/issues/);
  });
});
