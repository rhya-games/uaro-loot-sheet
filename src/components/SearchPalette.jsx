import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ItemIcon from './ItemIcon.jsx';
import { ActionBadges } from './ItemBadges.jsx';
import { createSearch } from '../utils/search.js';
import { moveHighlight, paletteResults } from '../utils/shortcut.js';
import { EMPTY_VIEW, viewToHash } from '../utils/viewUrl.js';

/**
 * The Cmd/Ctrl+K search box: a popover that finds an item from any page.
 * Picking a result opens the loot page searched for that item.
 *
 * It's a native <dialog> opened with showModal(), like WelcomeDialog, so the
 * browser keeps Tab inside it and returns focus when it closes. It keeps its
 * own query: typing here doesn't change the loot page's search, URL or
 * counts until you pick something.
 *
 * Props:
 *   open    - whether the popover is showing
 *   onClose - called when it should close (Escape, a click outside, or a pick)
 *   items   - the items to search (the site's items, or admin mode's edited ones)
 */
export default function SearchPalette({ open, onClose, items }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Stop the page behind from scrolling. The scrollbar's width is added as
  // padding so the page doesn't jump sideways when the scrollbar disappears.
  useEffect(() => {
    if (!open) return undefined;
    const { style } = document.body;
    const previous = { overflow: style.overflow, paddingRight: style.paddingRight };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    style.overflow = 'hidden';
    if (scrollbar > 0) style.paddingRight = `${scrollbar}px`;
    return () => {
      style.overflow = previous.overflow;
      style.paddingRight = previous.paddingRight;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label="Search items"
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault(); // Escape is handled here; see AGENTS.md.
        onClose();
      }}
      // Also covers closing without the keyboard (for example, Android's back gesture).
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A click on the dimmed area lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      // 13rem is half the popover's tallest size (input, 6 results and the
      // "Show all" row), so that size is centered and shorter ones hang from its top.
      className="panel mx-auto mt-[max(1rem,calc(50dvh-13rem))] mb-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-hidden p-0 text-body backdrop:bg-black/50"
    >
      {/* Mounted only while open, so every opening starts with an empty box. */}
      {open && <PaletteBody items={items} onClose={onClose} />}
    </dialog>
  );
}

/** The input and the results. See SearchPalette for the props. */
function PaletteBody({ items, onClose }) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const search = useMemo(() => createSearch(items), [items]);
  const { results, total } = paletteResults(search, query);
  // "Show all N results" only appears when some matches aren't listed; it's the last stop.
  const hasMore = total > results.length;
  const stops = results.length + (hasMore ? 1 : 0);
  const active = Math.min(highlight, stops - 1);

  const pick = (item) => {
    onClose();
    // The loot page picks the view up from the hash (see LootPage), from any page.
    window.location.hash = viewToHash({ ...EMPTY_VIEW, query: item.name });
    window.scrollTo({ top: 0 });
  };

  const showAll = () => {
    onClose();
    window.location.hash = viewToHash({ ...EMPTY_VIEW, query: query.trim() });
    window.scrollTo({ top: 0 });
  };
  const choose = (index) => (index < results.length ? pick(results[index]) : showAll());

  return (
    <div>
      {/* The input's focus ring is drawn inside the box, so it must not paint a gap over the border below. */}
      <div className="flex items-center gap-3 border-b border-line px-4 [--focus-gap:transparent]">
        <MagnifyingGlassIcon className="size-5 shrink-0 text-muted" aria-hidden="true" />
        <input
          autoFocus
          type="text"
          role="combobox"
          aria-expanded={stops > 0}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Search items by name, ID or use"
          placeholder="Search items by name, ID or use"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlight(0);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Tab') {
              // The input is the only stop; keep focus here instead of leaving the popover.
              event.preventDefault();
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setHighlight(moveHighlight(active, event.key, stops));
            } else if (event.key === 'Enter' && active >= 0) {
              event.preventDefault();
              choose(active);
            }
          }}
          className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-fg placeholder:text-muted focus:outline-none"
        />
      </div>

      <ul
        id={listId}
        role="listbox"
        aria-label="Results"
        className="max-h-[calc(100dvh-6rem)] overflow-y-auto p-2 empty:hidden"
      >
        {results.map((item, index) => (
          <li
            key={item.id ?? item.itemId}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === active}
            onMouseMove={() => setHighlight(index)}
            onClick={() => pick(item)}
            className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 ${
              index === active ? 'bg-hover' : ''
            }`}
          >
            <ItemIcon item={item} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-fg">{item.name}</div>
              <div className="text-xs text-muted">
                {item.itemType} · {item.itemId}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              <ActionBadges actions={item.actions} />
            </div>
          </li>
        ))}
        {hasMore && (
          <li
            id={`${listId}-${results.length}`}
            role="option"
            aria-selected={active === results.length}
            onMouseMove={() => setHighlight(results.length)}
            onClick={showAll}
            className={`cursor-pointer rounded-lg px-2 py-2 text-sm text-muted ${
              active === results.length ? 'bg-hover' : ''
            }`}
          >
            Show all {total} results
          </li>
        )}
      </ul>

      {query.trim() === '' && (
        <p className="px-4 py-6 text-center text-sm text-muted">Type to find an item. Press Esc to close.</p>
      )}
      {query.trim() !== '' && results.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-muted">No items found.</p>
      )}
    </div>
  );
}
