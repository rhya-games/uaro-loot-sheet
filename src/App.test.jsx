// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import App from './App.jsx';
import { loadItems } from './admin/useAdmin.js';

// React wants to know it runs under a test harness (act).
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no layout, so pretend the window is a wide desktop one.
beforeAll(() => {
  window.matchMedia = (query) => ({
    matches: true,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });
  window.scrollTo = () => {};
  // Don't open the welcome box over the page.
  window.localStorage.setItem('uaro-loot-sheet:welcomeSeen', 'true');
});

let root;
let container;

async function openPage(hash) {
  window.location.hash = hash;
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  // The item data arrives after the first draw; wait for it before looking.
  await act(async () => {
    root.render(<App />);
    await loadItems();
  });
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = container = undefined;
});

// Each test draws the whole 1,000+ row page (even on the other pages, the loot
// page stays mounted behind them), which takes a few seconds on a slow CI
// machine, so the default 5 seconds is too tight.
describe('App', { timeout: 30_000 }, () => {
  it('draws the loot table with items and a count', async () => {
    await openPage('#/');
    expect(container.querySelector('h1').textContent).toBe('Loot items');
    expect(container.querySelectorAll('tbody tr').length).toBeGreaterThan(10);
    // Header cells also hold a sort mark and a tooltip, so match the start of the text.
    const headers = [...container.querySelectorAll('thead th')].map((th) => th.textContent);
    for (const label of ['Item Name', 'Action', 'Used For']) {
      expect(headers.some((text) => text.startsWith(label))).toBe(true);
    }
  });

  it('opens the other pages from their links', async () => {
    for (const [hash, title] of [
      ['#/about', 'About'],
      ['#/feedback', 'Feedback'],
      ['#/changelog', 'Changelog'],
    ]) {
      await openPage(hash);
      expect(document.title).toBe(`${title} · uaRO Loot Sheet`);
      expect(container.querySelector('main h1:not(.sr-only)')?.textContent).toBe(title);
      act(() => root.unmount());
      container.remove();
      root = container = undefined;
    }
  });

  it('keeps the page frame (skip link, header, footer) on every page', async () => {
    await openPage('#/about');
    expect(container.querySelector('a[href="#main"]')).not.toBeNull();
    expect(container.querySelector('header')).not.toBeNull();
    expect(container.querySelector('footer')).not.toBeNull();
  });
});
