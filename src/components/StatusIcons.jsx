import { CheckIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
// The one solid icon: a filled star reads as "best" at a glance.
import { StarIcon } from '@heroicons/react/24/solid';
import { formatZeny } from '../utils/format.js';
import { NPC_BUYABLE_LABELS } from '../utils/labels.js';
import { bestSale, isSoldByNpc, isTradeable } from '../utils/prices.js';
import Tooltip from './Tooltip.jsx';

/**
 * Small ✓ / ✕ icons used in place of "Yes" / "No" text. `label` is read by
 * screen readers instead of the icon.
 */
export function YesIcon({ label }) {
  return (
    <span className="inline-flex text-emerald-700 dark:text-emerald-400">
      <CheckIcon className="size-5" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function NoIcon({ label }) {
  return (
    <span className="inline-flex text-muted">
      <XMarkIcon className="size-5" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * A "?" for a value nobody has checked yet, drawn like the ✕ and ✓ (same
 * 20px box and line weight) so they line up. Heroicons has no question mark
 * without a circle, so this is the curve and dot from its question-mark
 * icon, enlarged to about the ✕'s width (the line keeps its weight).
 * Screen readers get words instead.
 */
export function Unknown() {
  return (
    <span className="empty-value inline-flex">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path transform="translate(12 12) scale(1.45) translate(-12 -12)" vectorEffect="non-scaling-stroke" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 17.25h.008v.008H12v-.008Z" />
      </svg>
      <span className="sr-only">Not verified yet</span>
    </span>
  );
}

/**
 * A green star on whichever way of selling pays the most (see bestSale in
 * utils/prices.js). It stands in for the vend price, which isn't shown.
 * `label` is the tooltip and what screen readers say. `className` sets the
 * icon size (size-5 on its own, size-4 beside a value).
 */
export function BestStar({ label, className = 'size-5' }) {
  return (
    <Tooltip text={label}>
      <span tabIndex={0} className="inline-flex rounded text-emerald-700 dark:text-emerald-400">
        <StarIcon className={className} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    </Tooltip>
  );
}

export const BEST_VEND_LABEL = 'Best price: sell to players (vend)';
export const BEST_NPC_LABEL = 'Best price: sell to an NPC';

/**
 * The Vend cell on the public site: no price, only a green star when
 * vending pays the most. Where it doesn't (the NPC pays the same or more, or
 * nobody is selling it) there's a quiet dash, so the cell doesn't look like
 * missing data; the star is in the NPC column. Where nothing can be compared
 * it shows ✕ (can't be vended) or ? (price not known yet), as PlayerPrice does.
 */
export function VendStar({ item }) {
  const best = bestSale(item);
  if (best === 'vend') return <BestStar label={BEST_VEND_LABEL} />;
  const vendable = isTradeable(item) && !isSoldByNpc(item);
  if (vendable && item.avgVend != null) {
    const label = best === 'npc' ? 'Not the best price: an NPC pays the same or more' : 'Not the best price: nobody was selling it';
    return (
      <Tooltip text={label}>
        <span tabIndex={0} className="empty-value inline-flex rounded">
          <MinusIcon className="size-5" aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </span>
      </Tooltip>
    );
  }
  return <PlayerPrice item={item} />;
}

/**
 * A mark at full strength in the main text color, for legends and guides.
 * In the table the marks are faded on purpose; the important modifiers
 * (the trailing "!") beat that styling for everything inside.
 */
export function Mark({ children }) {
  return <span className="inline-flex text-fg [&_*]:text-fg! [&_*]:opacity-100!">{children}</span>;
}

/** "Can you buy this from an NPC?": ✓ (yes, or NPC only), ✕, or "?" (unknown). */
export function NpcBuyable({ item }) {
  if (item.npcBuyable === 'yes' || item.npcBuyable === 'npc-only') {
    return <YesIcon label={NPC_BUYABLE_LABELS[item.npcBuyable]} />;
  }
  if (item.npcBuyable === 'no') return <NoIcon label="No" />;
  return <Unknown />;
}

/**
 * The vend price (avgVend), for admin mode (the public site shows a star,
 * see VendStar). Two ways to show "no price":
 *   ✕     can't be sold this way: can't be traded (with a tooltip, since
 *         it's rare) or NPCs sell it
 *   ?     not checked yet (null), an icon like the ✕
 * A price of 0 (checked, nobody selling) shows as "0z".
 * The column headers' tooltips and the About page explain these.
 */
export function PlayerPrice({ item }) {
  if (!isTradeable(item)) {
    return (
      <Tooltip text="Can't be traded">
        <span tabIndex={0} className="inline-flex rounded">
          <NoIcon label="None: can't be traded" />
        </span>
      </Tooltip>
    );
  }
  if (isSoldByNpc(item)) return <NoIcon label="None: NPCs sell this" />;
  return item.avgVend == null ? <Unknown /> : formatZeny(item.avgVend);
}
