import Tooltip from './Tooltip.jsx';
import { formatVerified, verifiedTooltip } from '../utils/format.js';

/**
 * "12 days ago" / ">30 Days". When there's a real date, it can be focused
 * (Tab) or hovered to show the exact date and any notes.
 *
 * Props:
 *   item - one entry from loot.json
 */
export default function VerifiedText({ item }) {
  const text = formatVerified(item.lastVerified);
  if (!item.lastVerified) return text;
  return (
    <Tooltip text={verifiedTooltip(item)}>
      <span tabIndex={0} className="rounded underline decoration-muted decoration-dotted underline-offset-2">
        {text}
      </span>
    </Tooltip>
  );
}
