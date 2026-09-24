import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatZeny } from '../utils/format.js';
import { NPC_BUYABLE_LABELS } from '../utils/labels.js';
import { hasWhobuy, isSoldByNpc, isTradeable } from '../utils/prices.js';
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

/** "Can you buy this from an NPC?": ✓ (yes, or NPC only), ✕, or "—" (unknown). */
export function NpcBuyable({ item }) {
  if (item.npcBuyable === 'yes' || item.npcBuyable === 'npc-only') {
    return <YesIcon label={NPC_BUYABLE_LABELS[item.npcBuyable]} />;
  }
  if (item.npcBuyable === 'no') return <NoIcon label="No" />;
  return '—';
}

/**
 * A player price (avgVend or avgWhobuy). Three ways to show "no price":
 *   ✕     can't be sold this way: can't be traded (with a tooltip, since
 *         it's rare), NPCs sell it, or a card or equipment in the Whobuy
 *         column (@whobuy doesn't buy them)
 *   None  checked in game (saved as 0), and nobody was buying or selling
 *   —     not checked yet (null)
 * The column headers' tooltips and the About page explain these.
 */
export function PlayerPrice({ item, field }) {
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
  if (field === 'avgWhobuy' && !hasWhobuy(item)) return <NoIcon label="None: @whobuy doesn't buy cards or equipment" />;
  if (item[field] === 0) {
    return (
      <span className="text-muted">
        None<span className="sr-only">: checked, and nobody was {field === 'avgWhobuy' ? 'buying' : 'selling'}</span>
      </span>
    );
  }
  return formatZeny(item[field]);
}
