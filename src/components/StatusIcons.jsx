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
 * A player price (avgVend or avgWhobuy), or ✕ when there isn't one:
 *   - items that can't be traded at all (with a tooltip, since it's rare)
 *   - items NPCs sell, and cards and equipment in the Whobuy column
 *     (@whobuy doesn't buy them)
 *   - 0: checked in game, and nobody was buying or selling it
 * The column headers' tooltips explain the ✕.
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
  if (item[field] === 0) return <NoIcon label={field === 'avgWhobuy' ? 'No buyers' : 'No sellers'} />;
  return formatZeny(item[field]);
}
