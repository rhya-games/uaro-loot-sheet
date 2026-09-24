import { useEffect, useRef, useState } from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';
import { copyText } from '../utils/clipboard.js';

/** How long "Copied!" shows before the button goes back to "Copy link". */
const COPIED_MS = 1500;

/**
 * Copies the page's address, which always holds the current search, filters
 * and sort (see utils/viewUrl.js), so the same view opens for whoever gets it.
 * The label says "Copied!" for a moment, and screen readers hear it too.
 */
export default function CopyLinkButton() {
  const [status, setStatus] = useState(null); // null | 'copied' | 'failed'
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    setStatus((await copyText(window.location.href)) ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(null), COPIED_MS);
  };

  const label = status === 'copied' ? 'Copied!' : status === 'failed' ? 'Couldn’t copy' : 'Copy link';
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="button-small inline-flex items-center gap-1.5"
    >
      <LinkIcon className="size-4" aria-hidden="true" />
      {/* Every label shares one grid cell, so the button keeps the longest one's width. */}
      <span className="grid" aria-hidden="true">
        {['Copy link', 'Copied!', 'Couldn’t copy'].map((text) => (
          <span key={text} className={`col-start-1 row-start-1 ${text === label ? '' : 'invisible'}`}>
            {text}
          </span>
        ))}
      </span>
      {/* Tells screen readers when it copied (the label change alone isn't announced). */}
      <span className="sr-only" aria-live="polite">
        {status ? label : ''}
      </span>
    </button>
  );
}
