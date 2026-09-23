import { useEffect, useId, useRef, useState } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip.jsx';
import { ROW_ACTIONS } from '../config.js';

/** Round icon button look, shared by the single action and the ⋮ menu button. */
const ICON_BUTTON_STYLE =
  'flex size-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900';

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
 */
function ActionsMenu({ item }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const menuItems = () => [...(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? [])];

  const close = ({ returnFocus = false } = {}) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  // When the menu opens, focus its first item.
  useEffect(() => {
    if (open) menuItems()[0]?.focus();
  }, [open]);

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
    <div className="relative inline-block">
      <Tooltip text="More actions">
        <button
          ref={buttonRef}
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
      {open && (
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={`Actions for ${item.name}`}
          onKeyDown={onMenuKeyDown}
          className="panel absolute right-0 z-20 mt-1 min-w-36 py-1 text-left"
        >
          {ROW_ACTIONS.map((action) => (
            <li key={action.id} role="none">
              <a
                {...linkProps(action, item)}
                role="menuitem"
                tabIndex={-1}
                onClick={() => close()}
                className="block px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100"
              >
                {action.label}
                {action.external && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
