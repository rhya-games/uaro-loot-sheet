import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatZeny } from '../utils/format.js';
import { NPC_BUYABLE_LABELS } from '../utils/labels.js';
import { isSoldByNpc } from '../utils/prices.js';

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
 * A player price (avgVend or avgWhobuy). Items NPCs sell show ✕: players
 * don't trade them, so there's no player price.
 */
export function PlayerPrice({ item, field }) {
  if (isSoldByNpc(item)) return <NoIcon label="None: NPCs sell this" />;
  return formatZeny(item[field]);
}
