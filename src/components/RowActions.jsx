import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { usePresence } from '../utils/usePresence.js';
import Tooltip from './Tooltip.jsx';
import { ROW_ACTIONS } from '../config.js';

/** Round icon button look, shared by the single action and the ⋮ menu button. */
const ICON_BUTTON_STYLE =
  'flex size-8 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-fg';

/** Props an <a> needs to open one row action. */
function linkProps(action, item) {
  return {
    href: action.href(item),
    ...(action.external && { target: '_blank', rel: 'noopener noreferrer' }),
  };
}

/**
 * The actions for one item (see ROW_ACTIONS in config.js).
 * One action: shown as its icon, with a tooltip. Two or more: a ⋮ menu button.
 *
 * Props:
 *   item - one entry from loot.json
 */
export default function RowActions({ item }) {
  if (ROW_ACTIONS.length === 1) {
    const [action] = ROW_ACTIONS;
    const Icon = action.icon;
    return (
      <Tooltip text={action.label}>
        <a
          {...linkProps(action, item)}
          aria-label={`${action.label}: ${item.name}${action.external ? ' (opens in a new tab)' : ''}`}
          className={ICON_BUTTON_STYLE}
        >
          <Icon className="size-5" aria-hidden="true" />
        </a>
      </Tooltip>
    );
  }
  return <ActionsMenu item={item} />;
}

/**
 * A ⋮ button that opens a small menu, following the WAI-ARIA "menu button"
 * pattern (https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/):
 *   - Enter, Space or ↓ opens it and focuses the first item
 *   - ↑ / ↓ move between items, Home / End jump to the ends
 *   - Escape closes it and returns focus to the button
 *   - Tab or clicking outside closes it
 *
 * Like tooltips, the menu is drawn at the end of the page and positioned with
 * Floating UI, so the table's scroll box can't cut it off.
 */
function ActionsMenu({ item }) {
  const [open, setOpen] = useState(false);
  const { mounted, visible } = usePresence(open, 150);
  const menuId = useId();
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-end',
    strategy: 'fixed',
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const setButton = (element) => {
    buttonRef.current = element;
    refs.setReference(element);
  };
  const setMenu = (element) => {
    menuRef.current = element;
    refs.setFloating(element);
  };

  const menuItems = () => [...(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? [])];

  const close = ({ returnFocus = false } = {}) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  // Once the opened menu is on the page, focus its first item.
  useEffect(() => {
    if (open && mounted) menuItems()[0]?.focus();
  }, [open, mounted]);

  // Close when clicking anywhere outside the menu.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onButtonKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onMenuKeyDown = (event) => {
    const items = menuItems();
    const index = items.indexOf(document.activeElement);
    const focusAt = (i) => items[(i + items.length) % items.length]?.focus();

    if (event.key === 'ArrowDown') focusAt(index + 1);
    else if (event.key === 'ArrowUp') focusAt(index - 1);
    else if (event.key === 'Home') focusAt(0);
    else if (event.key === 'End') focusAt(items.length - 1);
    else if (event.key === 'Escape') close({ returnFocus: true });
    else if (event.key === 'Tab') close();
    else return;
    if (event.key !== 'Tab') event.preventDefault();
  };

  return (
    <div className="inline-block">
      <Tooltip text="More actions">
        <button
          ref={setButton}
          type="button"
          onClick={() => setOpen((isOpen) => !isOpen)}
          onKeyDown={onButtonKeyDown}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={`Actions for ${item.name}`}
          className={ICON_BUTTON_STYLE}
        >
          <EllipsisVerticalIcon className="size-5" aria-hidden="true" />
        </button>
      </Tooltip>
      {mounted &&
        createPortal(
          <ul
            ref={setMenu}
            style={floatingStyles}
            id={menuId}
            role="menu"
            aria-label={`Actions for ${item.name}`}
            onKeyDown={onMenuKeyDown}
            // Fades and grows in from the button's corner (instant with reduced motion).
            className={`panel z-[55] min-w-36 origin-top-right py-1 text-left transition duration-150 ease-smooth
              motion-reduce:transition-none ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          >
            {ROW_ACTIONS.map((action) => (
              <li key={action.id} role="none">
                <a
                  {...linkProps(action, item)}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => close()}
                  className="block px-3 py-2 text-sm text-body hover:bg-hover focus:bg-hover"
                >
                  {action.label}
                  {action.external && <span className="sr-only"> (opens in a new tab)</span>}
                </a>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}
