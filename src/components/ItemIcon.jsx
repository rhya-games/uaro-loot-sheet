import { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

/**
 * What shows when an icon can't load:
 *   'apple'       - the Apple icon, an inside joke from the game
 *   'placeholder' - a gray square with a "no picture" mark
 * The placeholder is also the last resort if the Apple icon is missing too.
 */
const MISSING_ICON = 'apple';
const APPLE_FILE = 'item512.gif';

/**
 * The item's 24x24 game icon (public/items/, filled by `npm run sync:icons`).
 * Every card shares one picture, like in the game. The icon is decoration:
 * the name is always next to it, so it has no alt text. If the file is
 * missing or fails to load, a stand-in takes its place (see MISSING_ICON), so
 * names still line up and nothing shows as a broken image.
 *
 * Props:
 *   item - one entry from src/data/loot.json
 */
export default function ItemIcon({ item }) {
  const file = item.categories.includes('Card') ? 'card.gif' : `item${item.itemId}.gif`;
  const base = `${import.meta.env.BASE_URL}items/`;
  const src = base + file;
  // Remember which file failed (not just "failed"), so a row that is reused
  // for another item tries the new icon.
  const [failedSrc, setFailedSrc] = useState(null);
  const [appleFailed, setAppleFailed] = useState(false);
  const failed = failedSrc === src;
  const useApple =
    failed && MISSING_ICON === 'apple' && file !== APPLE_FILE && !appleFailed;

  if (failed && !useApple) {
    return (
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-line-strong text-muted"
      >
        <PhotoIcon className="size-4" />
      </span>
    );
  }

  return (
    <img
      src={useApple ? base + APPLE_FILE : src}
      alt=""
      width={24}
      height={24}
      loading="lazy"
      decoding="async"
      // Keeps the 24px pixels crisp on high-density screens.
      className="size-6 shrink-0 [image-rendering:pixelated]"
      // If the Apple stand-in fails too, the placeholder takes over.
      onError={() => (useApple ? setAppleFailed(true) : setFailedSrc(src))}
    />
  );
}
