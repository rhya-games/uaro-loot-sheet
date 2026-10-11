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
 */
export function Page({ title, intro, contents, children }) {
  const column = (
    <div className={`min-w-0 flex-1 space-y-6 ${contents ? 'max-w-3xl' : ''}`}>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-fg">{title}</h1>
        {intro && <p className="text-lg text-muted">{intro}</p>}
      </header>
      {children}
    </div>
  );

  if (!contents) return <div className="mx-auto flex max-w-3xl text-body">{column}</div>;

  return (
    <div className="mx-auto flex max-w-5xl items-start gap-10 text-body">
      <Contents entries={contents} />
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

/**
 * The "On this page" jump list. The section the reader is in is
 * marked with a thicker green bar and bold text.
 */
function Contents({ entries }) {
  const [activeId, choose] = useActiveSection(entries);
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
  }, [activeId]);

  return (
    <nav aria-label="On this page" className="sticky top-24 hidden w-48 shrink-0 pt-14 lg:block">
      {/* Never taller than the room under the header, so no entry is out of reach. The side
          padding and negative margin keep the focus rings from being clipped. */}
      <ul ref={listRef} className="-mx-1 max-h-[calc(100vh-11rem)] overflow-y-auto px-1 text-sm">
        {entries.map((entry) => {
          const active = entry.id === activeId;
          return (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => {
                  choose(entry.id);
                  scrollToId(entry.id);
                }}
                aria-current={active ? 'location' : undefined}
                className={`block w-full py-1.5 text-left ${
                  active
                    ? 'border-l-4 border-accent pl-2.5 font-semibold text-accent'
                    : 'border-l-2 border-line-strong pl-3 text-muted hover:text-fg'
                }`}
              >
                {entry.title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
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
