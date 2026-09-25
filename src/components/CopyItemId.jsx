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
 * Props:
 *   itemId - the number to copy
 */
export default function CopyItemId({ itemId }) {
  const [status, setStatus] = useState(null); // null | 'copied' | 'failed'
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    track('copy-item-id', { item: itemId });
    setStatus((await copyText(String(itemId))) ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(null), COPIED_MS);
  };

  const text = status === 'copied' ? 'Copied!' : status === 'failed' ? "Couldn't copy" : 'Copy item ID';
  return (
    <Tooltip text={text}>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy item ID ${itemId}`}
        className="rounded tabular-nums hover:text-fg hover:underline hover:decoration-dotted"
      >
        #{itemId}
        <span className="sr-only" aria-live="polite">
          {status === 'copied' ? 'Copied' : ''}
        </span>
      </button>
    </Tooltip>
  );
}
