// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import LoadingItems from './LoadingItems.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function draw(element) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(element));
  return container;
}

describe('LoadingItems', () => {
  it('says the items are loading, politely', () => {
    const view = draw(<LoadingItems />);
    expect(view.textContent).toBe('Loading items…');
    expect(view.firstChild.getAttribute('role')).toBe('status');
  });

  it('says what to do when the download failed', () => {
    const view = draw(<LoadingItems failed />);
    expect(view.textContent).toMatch(/couldn’t be loaded/);
    expect(view.firstChild.getAttribute('role')).toBe('alert');
    expect(view.querySelector('button').textContent).toBe('Reload');
  });
});
