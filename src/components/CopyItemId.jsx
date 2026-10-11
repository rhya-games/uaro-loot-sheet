import { useEffect, useRef, useState } from 'react';
import Tooltip from './Tooltip.jsx';
import { copyText } from '../utils/clipboard.js';
import { track } from '../utils/analytics.js';

/** How long "Copied!" shows before the tooltip goes back to normal. */
const COPIED_MS = 1500;

/**
 * An item ID ("#7539") that copies itself to the clipboard when clicked (or
 * focused and Enter/Space pressed). The tooltip says "Copy item ID", then
 * "Copied!" for a moment. Screen readers hear the result too.
 *
 * With `command` ("@ws", "@wb") it shows and copies the in-game command
 * instead ("@ws 969"), ready to paste into the chat box.
 *
 * Props:
 *   itemId  - the number to copy
 *   command - optional chat command to put before the number
 */
export default function CopyItemId({ itemId, command }) {
  const copied = command ? `${command} ${itemId}` : String(itemId);
  const [status, setStatus] = useState(null); // null | 'copied' | 'failed'
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    track('copy-item-id', { item: itemId, ...(command && { command }) });
    setStatus((await copyText(copied)) ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(null), COPIED_MS);
  };

  const text = status === 'copied' ? 'Copied!' : status === 'failed' ? "Couldn't copy" : command ? `Copy ${copied}` : 'Copy item ID';
  return (
    <Tooltip text={text}>
      <button
        type="button"
        onClick={copy}
        aria-label={command ? `Copy ${copied}` : `Copy item ID ${itemId}`}
        className="rounded tabular-nums hover:text-fg hover:underline hover:decoration-dotted"
      >
        {command ? copied : `#${itemId}`}
        <span className="sr-only" aria-live="polite">
          {status === 'copied' ? 'Copied' : ''}
        </span>
      </button>
    </Tooltip>
  );
}
