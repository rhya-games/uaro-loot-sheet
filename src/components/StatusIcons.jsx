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
      <CheckIcon className="size-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function NoIcon({ label }) {
  return (
    <span className="inline-flex text-muted">
      <XMarkIcon className="size-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** "Can you buy this from an NPC?": ✓, ✕, "NPC Only", or "—" (unknown). */
export function NpcBuyable({ item }) {
  if (item.npcBuyable === 'yes') return <YesIcon label="Yes" />;
  if (item.npcBuyable === 'no') return <NoIcon label="No" />;
  return NPC_BUYABLE_LABELS[item.npcBuyable] ?? '—';
}

/**
 * A player price (avgVend or avgWhobuy). Items NPCs sell show ✕: players
 * don't trade them, so there's no player price.
 */
export function PlayerPrice({ item, field }) {
  if (isSoldByNpc(item)) return <NoIcon label="None: NPCs sell this" />;
  return formatZeny(item[field]);
}
