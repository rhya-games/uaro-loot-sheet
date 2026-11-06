import { CheckIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
// The one solid icon: a filled star reads as "best" at a glance.
import { StarIcon } from '@heroicons/react/24/solid';
import { formatZeny } from '../utils/format.js';
import { NPC_BUYABLE_LABELS } from '../utils/labels.js';
import { bestSale, isSoldByNpc, isTradeable, vendState } from '../utils/prices.js';
import Tooltip from './Tooltip.jsx';

/** Box sizes of the status marks in the Vend, Sell to NPC and Buy at NPC columns. */
const STAR_SIZE = 'size-7'; // 28px
const MARK_SIZE = 'size-6'; // 24px icon, for ✓ ✕ –
const MARK_BOX = 'size-7'; // in a 28px box, the same space as the star

/**
 * The marks' colors, and the small color shift when you point at one or tab to
 * it (the focusable ones, which have a tooltip). The ✕ and – are quiet (half
 * strength) and come up to full on hover or focus. In legends, `Mark` forces
 * them to full strength.
 */
const MARK_TONES = {
  quiet: 'text-muted opacity-50 hover:text-fg hover:opacity-100 focus-visible:text-fg focus-visible:opacity-100',
  yes: 'text-emerald-700 hover:text-emerald-600 focus-visible:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 dark:focus-visible:text-emerald-300',
  best: 'text-amber-600 hover:text-amber-500 focus-visible:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 dark:focus-visible:text-amber-300',
};
const MARK_SHIFT = 'transition-[color,opacity] duration-200 ease-in-out motion-reduce:transition-none';

/**
 * One status mark: the icon (as children), its screen reader text, and, when
 * `tooltip` is set, a tooltip that keyboard users can reach too (the mark
 * becomes focusable). `tone` is a key of MARK_TONES.
 */
function StatusMark({ tone, label, tooltip, children }) {
  const mark = (
    <span tabIndex={tooltip ? 0 : undefined} className={`inline-flex ${MARK_BOX} items-center justify-center rounded ${MARK_TONES[tone]} ${MARK_SHIFT}`}>
      {children}
      <span className="sr-only">{label}</span>
    </span>
  );
  return tooltip ? <Tooltip text={tooltip}>{mark}</Tooltip> : mark;
}

/**
 * Small ✓ / ✕ icons used in place of "Yes" / "No" text. `label` is read by
 * screen readers instead of the icon; `tooltip` (optional) says it on hover.
 */
export function YesIcon({ label, tooltip }) {
  return (
    <StatusMark tone="yes" label={label} tooltip={tooltip}>
      <CheckIcon className={MARK_SIZE} aria-hidden="true" />
    </StatusMark>
  );
}

export function NoIcon({ label, tooltip }) {
  return (
    <StatusMark tone="quiet" label={label} tooltip={tooltip}>
      <XMarkIcon className={MARK_SIZE} aria-hidden="true" />
    </StatusMark>
  );
}

/** The quiet – (vending isn't the best price). */
export function DashIcon({ label, tooltip }) {
  return (
    <StatusMark tone="quiet" label={label} tooltip={tooltip}>
      <MinusIcon className={MARK_SIZE} aria-hidden="true" />
    </StatusMark>
  );
}

/**
 * The mark for a value nobody has checked yet: a ✕ with a "Not verified yet"
 * tooltip (it used to be a "?").
 */
export function Unknown() {
  return <NoIcon label="Not verified yet" tooltip="Not verified yet" />;
}

/**
 * A gold star on whichever way of selling pays the most (see bestSale in
 * utils/prices.js). It stands in for the vend price, which isn't shown.
 * `label` is the tooltip and what screen readers say. It's 28px (the other
 * marks are 20px) in the Vend column and beside the NPC price; in text it's
 * 20px, so it doesn't stretch the line. Set `inText` when it sits inside a
 * sentence, so it's centered on the line (in a table cell the default lines
 * up with the other icons). It jiggles a little under the pointer (not with
 * reduced motion).
 */
export function BestStar({ label, inText = false }) {
  return (
    <Tooltip text={label} className={inText ? 'inline-flex align-middle' : 'inline-flex'}>
      <span tabIndex={0} className={`inline-flex rounded ${MARK_TONES.best} ${MARK_SHIFT}`}>
        <StarIcon className={`${inText ? 'size-5' : STAR_SIZE} hover:animate-jiggle motion-reduce:animate-none`} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    </Tooltip>
  );
}

export const BEST_VEND_LABEL = 'Best price: sell to players (vend)';
export const BEST_NPC_LABEL = 'Best price: sell to an NPC';

/**
 * The Vend cell on the public site: no price, only a gold star when
 * vending pays the most. Where it doesn't (the NPC pays the same or more, or
 * nobody is selling it) there's a quiet dash, so the cell doesn't look like
 * missing data; the star is in the Sell to NPC column. Where nothing can be compared
 * it shows ✕ (can't be vended, or price not known yet), as PlayerPrice does.
 */
export function VendStar({ item }) {
  const best = bestSale(item);
  if (best === 'vend') return <BestStar label={BEST_VEND_LABEL} />;
  const vendable = isTradeable(item) && !isSoldByNpc(item);
  if (vendable && vendState(item) !== 'unknown') {
    const label = best === 'npc' ? 'Not the best price: an NPC pays the same or more' : 'Not the best price: nobody was selling it';
    return <DashIcon label={label} tooltip={label} />;
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

/** "Can you buy this from an NPC?": ✓ (yes, or NPC only), or ✕ (no, or not verified yet). */
export function NpcBuyable({ item }) {
  if (item.npcBuyable === 'yes' || item.npcBuyable === 'npc-only') {
    return <YesIcon label={NPC_BUYABLE_LABELS[item.npcBuyable]} tooltip={NPC_BUYABLE_LABELS[item.npcBuyable]} />;
  }
  if (item.npcBuyable === 'no') return <NoIcon label="No" tooltip="Not sold by NPCs" />;
  return <Unknown />;
}

/**
 * The vend price (avgVend), for admin mode (the public site shows a star,
 * see VendStar). Two ways to show "no price":
 *   ✕     can't be sold this way: can't be traded or NPCs sell it (both
 *         with a tooltip saying why, since the ✕ has no label)
 *   ✕     not checked yet (null), with a "Not verified yet" tooltip
 * A price of 0 (checked, nobody selling) shows as "0z".
 * The column headers' tooltips and the About page explain these.
 */
export function PlayerPrice({ item }) {
  if (!isTradeable(item)) return <NoIcon label="None: can't be traded" tooltip="Can't be traded" />;
  if (isSoldByNpc(item)) return <NoIcon label="None: NPCs sell this" tooltip="Can't be vended: NPCs sell it" />;
  return item.avgVend == null ? <Unknown /> : formatZeny(item.avgVend);
}
