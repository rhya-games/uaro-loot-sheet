import { useCallback, useEffect, useRef, useState } from 'react';
import { scrollToId } from '../utils/scroll.js';

/**
 * Building blocks for text pages (About, Feedback, Contribute, Changelog),
 * so they all share one heading scale and layout:
 *   page title  (h1) 30px bold
 *   section     (h2) 20px semibold
 *   sub-heading (h3) 18px semibold
 *   body text        16px
 */

/**
 * The page frame: a narrow readable column with the page title on top.
 * Long pages pass `contents` (a list of `{ id, title }` matching their
 * Sections' `id`s): on wide screens a sticky list of jump links fills the
 * space beside the column, so the text keeps a readable line length.
 * A page can pass its own `side` (a SideNav) instead, as the admin pages do.
 */
export function Page({ title, intro, contents, side, children }) {
  const column = (
    <div className={`min-w-0 flex-1 space-y-6 ${contents || side ? 'max-w-3xl' : ''}`}>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-fg">{title}</h1>
        {intro && <p className="text-lg text-muted">{intro}</p>}
      </header>
      {children}
    </div>
  );

  if (!contents && !side) return <div className="mx-auto flex max-w-3xl text-body">{column}</div>;

  // Stacked below lg, where the sidebar is hidden (a page can put its own
  // narrow-screen list in `side`).
  return (
    <div className="mx-auto max-w-5xl text-body lg:flex lg:items-start lg:gap-10">
      {side ?? <Contents entries={contents} />}
      {column}
    </div>
  );
}

/** One white panel with a section title. `id` makes it a jump target. */
export function Section({ title, id, children }) {
  return (
    <section id={id} className="panel space-y-3 p-6">
      <h2 className="text-xl font-semibold text-fg">{title}</h2>
      {children}
    </section>
  );
}

/** A heading inside a Section. */
export function SubHeading({ children }) {
  return <h3 className="pt-4 text-lg font-semibold text-fg">{children}</h3>;
}

/** A bulleted list with consistent spacing. */
export function BulletList({ children }) {
  return <ul className="list-disc space-y-1.5 pl-5 marker:text-muted">{children}</ul>;
}

/** Link that opens in a new tab, and says so to screen readers. */
export function ExternalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Link to another page of this site (same tab). */
export function PageLink({ href, children }) {
  return (
    <a
      href={href}
      className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
    >
      {children}
    </a>
  );
}

/** The "On this page" jump list: one button per section, scrolling to it. */
function Contents({ entries }) {
  const [activeId, choose] = useActiveSection(entries);
  return (
    <SideNav label="On this page" activeKey={activeId}>
      {entries.map((entry) => (
        <SideNavItem
          key={entry.id}
          active={entry.id === activeId}
          onClick={() => {
            choose(entry.id);
            scrollToId(entry.id);
          }}
        >
          {entry.title}
        </SideNavItem>
      ))}
    </SideNav>
  );
}

/**
 * The sticky list beside the page column (wide screens only). Its entries
 * are `SideNavItem`s. `activeKey` changes when the active entry does, so the
 * list can scroll it into view.
 */
export function SideNav({ label, activeKey, children }) {
  const listRef = useRef(null);

  // A long list scrolls inside its own box: keep the active entry in view
  // there. Set `scrollTop` by hand, because `scrollIntoView` would also
  // scroll the page.
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector('[aria-current]');
    if (!list || !active) return;
    const top = active.offsetTop - list.offsetTop;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (top + active.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top + active.offsetHeight - list.clientHeight;
    }
  }, [activeKey]);

  return (
    <nav aria-label={label} className="sticky top-24 hidden w-48 shrink-0 pt-14 lg:block">
      {/* Never taller than the room under the header, so no entry is out of reach. The side
          padding and negative margin keep the focus rings from being clipped. */}
      <ul ref={listRef} className="-mx-1 max-h-[calc(100vh-11rem)] overflow-y-auto px-1 text-sm">
        {children}
      </ul>
    </nav>
  );
}

/**
 * One entry of a SideNav: a button (`onClick`) or a link (`href`). The
 * active one gets a thicker green bar and bold text. `trailing` is a small
 * value on the right, such as a count.
 */
export function SideNavItem({ active, onClick, href, trailing, children }) {
  const className = `flex w-full items-baseline justify-between gap-2 py-1.5 text-left ${
    active
      ? 'border-l-4 border-accent pl-2.5 font-semibold text-accent'
      : 'border-l-2 border-line-strong pl-3 text-muted hover:text-fg'
  }`;
  const content = (
    <>
      <span>{children}</span>
      {trailing != null && <span className="font-normal text-muted tabular-nums">{trailing}</span>}
    </>
  );
  const current = active ? (href ? 'page' : 'location') : undefined;

  return (
    <li>
      {href ? (
        <a href={href} aria-current={current} className={className}>
          {content}
        </a>
      ) : (
        <button type="button" onClick={onClick} aria-current={current} className={className}>
          {content}
        </button>
      )}
    </li>
  );
}

/**
 * Tracks which section the reader is in: the last one whose top is above 40%
 * of the window height. Returns `[activeId, choose]`. `choose` is for jump
 * links: the last sections are short, and the page can't scroll far enough to
 * put them at the top, so the clicked one stays active until the reader
 * scrolls by hand.
 */
function useActiveSection(entries) {
  const [activeId, setActiveId] = useState(entries[0]?.id);
  const chosen = useRef(false);

  useEffect(() => {
    // Plain scroll listener: setting the same id again re-renders nothing,
    // and animation frames don't run in a hidden tab.
    const update = () => {
      if (chosen.current) return;
      let current = entries[0]?.id;
      for (const entry of entries) {
        const element = document.getElementById(entry.id);
        if (element && element.getBoundingClientRect().top <= window.innerHeight * 0.4) current = entry.id;
      }
      setActiveId(current);
    };
    const release = () => {
      chosen.current = false;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    for (const type of ['wheel', 'touchstart', 'keydown']) window.addEventListener(type, release, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      for (const type of ['wheel', 'touchstart', 'keydown']) window.removeEventListener(type, release);
    };
  }, [entries]);

  const choose = useCallback((id) => {
    chosen.current = true;
    setActiveId(id);
  }, []);

  return [activeId, choose];
}
