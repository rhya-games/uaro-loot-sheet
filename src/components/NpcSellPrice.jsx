import { LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip.jsx';
import { formatZeny } from '../utils/format.js';
import { OVERCHARGE_LEVEL, npcSellInfo } from '../utils/prices.js';

/**
 * The NPC (sell price) value for one item (see utils/prices.js):
 *   normal price    "15,500z"
 *   uaRO fixed      "2,000z" + lock icon (tooltip explains Overcharge doesn't apply)
 *   can't be sold   ✕ icon (tooltip explains why)
 *   unknown         "—"
 *
 * The special cases can be focused (Tab) so their tooltip is reachable by keyboard.
 */
export default function NpcSellPrice({ item }) {
  const info = npcSellInfo(item);

  if (info.kind === 'not-sellable') {
    return (
      <Tooltip text={`Can't be sold to NPCs (${info.reason})`}>
        <span tabIndex={0} className="inline-flex items-center rounded text-muted">
          <XMarkIcon className="size-4" aria-hidden="true" />
          <span className="sr-only">Can't be sold to NPCs</span>
        </span>
      </Tooltip>
    );
  }

  if (info.kind === 'modified') {
    return (
      <Tooltip text={`uaRO price: the most an NPC pays. Overcharge ${OVERCHARGE_LEVEL} doesn't raise it.`}>
        <span tabIndex={0} className="inline-flex items-center gap-1 rounded">
          <LockClosedIcon className="size-3.5 text-muted" aria-hidden="true" />
          {formatZeny(info.price)}
          <span className="sr-only"> (fixed uaRO price)</span>
        </span>
      </Tooltip>
    );
  }

  return info.kind === 'overcharge' ? formatZeny(info.price) : '—';
}
