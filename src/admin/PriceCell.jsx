import { useState } from 'react';
import { useAdmin } from './useAdmin.js';
import ZenyInput from './ZenyInput.jsx';
import { priceChanges } from './verify.js';
import { PlayerPrice, VendStar } from '../components/StatusIcons.jsx';
import { isSoldByNpc, isTradeable } from '../utils/prices.js';

/**
 * A vend cell. In admin mode it's a yes/no choice (see VendChoice): do players
 * pay more than an NPC? No price needed. Outside admin mode the cell is the
 * star (see VendStar), and where vending isn't possible (see PlayerPrice) it's
 * the normal read-only cell. The price boxes are on the admin queue pages
 * (see PriceInput).
 *
 * Props:
 *   item - one entry from loot.json
 */
export default function PriceCell({ item }) {
  const { enabled } = useAdmin();
  if (!enabled) return <VendStar item={item} />;
  const noPrice = !isTradeable(item) || isSoldByNpc(item);
  if (noPrice) return <PlayerPrice item={item} />;
  return <VendChoice item={item} />;
}

const VEND_CHOICES = [
  ['unknown', 'Not set', 'Not set'],
  ['higher', 'Yes: players pay more', 'Yes'],
  ['lower', 'No: the NPC pays the same or more', 'No'],
  ['none', 'Nobody buys it', 'Nobody buys it'],
];

/**
 * The maintainer's yes/no on one item: "do players pay more than an NPC?"
 * It's the item's `vend` setting, which gives the Vend star and the suggested
 * actions (see utils/prices.js). Choosing saves at once; the actions the new
 * answer suggests are saved with it.
 */
export function VendChoice({ item }) {
  const { saveItem } = useAdmin();
  const [error, setError] = useState(null);

  async function choose(event) {
    const [value, , short] = VEND_CHOICES.find(([flag]) => flag === event.target.value);
    setError(null);
    try {
      await saveItem(item.id, { vend: value }, `Vend: ${short}`);
    } catch (failure) {
      setError(failure.message);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        aria-label={`Do players pay more than an NPC for ${item.name}?`}
        value={item.vend ?? 'unknown'}
        onChange={choose}
        className="w-28 rounded-md border border-line bg-surface px-2 py-1 text-fg"
      >
        {VEND_CHOICES.map(([flag, label]) => (
          <option key={flag} value={flag}>
            {label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-700 dark:text-red-400">{error}</span>}
    </div>
  );
}

/**
 * The price box itself (also used by the admin queues). `advance` is passed
 * on to ZenyInput. Saving a price also marks the item as verified today (see
 * priceChanges), unless `verify` is false: then it only saves the price, and
 * something else (Verify prices' Confirm button) marks the item as checked.
 */
export function PriceInput({ item, field, advance, verify = true }) {
  const { saveItem } = useAdmin();

  const save = (value) => saveItem(item.id, verify ? priceChanges(item, { [field]: value }) : { [field]: value });

  return (
    <ZenyInput
      value={item[field]}
      onSave={save}
      label={`Vend price for ${item.name}`}
      noneHint="nobody selling"
      advance={advance}
    />
  );
}
