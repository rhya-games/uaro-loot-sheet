import { forwardRef, useEffect, useRef, useState } from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';
import { copyText } from '../utils/clipboard.js';
import { track } from '../utils/analytics.js';

/** How long "Copied!" shows before the button goes back to "Share". */
const COPIED_MS = 1500;

/** Phones and tablets have a share menu (Discord, Messages, ...); computers copy the link instead. */
const USE_SHARE_MENU = () => typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;

/**
 * Shares the page's address, which always holds the current search, filters
 * and sort (see utils/viewUrl.js), so the same view opens for whoever gets it.
 * On touch screens it opens the device's share menu; elsewhere it copies the
 * link and says "Copied!" for a moment (screen readers hear it too).
 *
 * Props:
 *   iconOnly  - show just the icon (small screens; wrap it in a Tooltip)
 *   className - extra classes (the button style comes from the toolbar)
 */
export default forwardRef(function ShareButton({ iconOnly = false, className = '', ...props }, ref) {
  const [status, setStatus] = useState(null); // null | 'copied' | 'failed'
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const share = async () => {
    const url = window.location.href;
    track('share', { how: USE_SHARE_MENU() ? 'menu' : 'copy' });
    if (USE_SHARE_MENU()) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return; // closed the menu: nothing to do
      }
    }
    setStatus((await copyText(url)) ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(null), COPIED_MS);
  };

  const label = status === 'copied' ? 'Copied!' : status === 'failed' ? 'Failed' : 'Share';
  return (
    <button ref={ref} type="button" onClick={share} aria-label={iconOnly ? 'Share' : label} className={className} {...props}>
      <ShareIcon className="size-5" aria-hidden="true" />
      {!iconOnly && (
        // Every label shares one grid cell, so the button keeps the longest one's width.
        <span className="grid" aria-hidden="true">
          {['Share', 'Copied!', 'Failed'].map((text) => (
            <span key={text} className={`col-start-1 row-start-1 ${text === label ? '' : 'invisible'}`}>
              {text}
            </span>
          ))}
        </span>
      )}
      {/* Tells screen readers (and icon-only users) what happened. */}
      <span className="sr-only" aria-live="polite">
        {status === 'copied' ? 'Link copied' : status === 'failed' ? 'Couldn’t copy the link' : ''}
      </span>
    </button>
  );
});
