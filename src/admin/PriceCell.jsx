import { useAdmin } from './useAdmin.js';
import ZenyInput from './ZenyInput.jsx';
import { priceChanges } from './verify.js';
import { PlayerPrice } from '../components/StatusIcons.jsx';
import { hasWhobuy, isSoldByNpc, isTradeable } from '../utils/prices.js';

/**
 * A Vend or Whobuy price cell. In admin mode it's a text box: type a price
 * and press Enter (or leave the box) to save it. That also marks the item
 * as verified today. Escape puts the old price back. 0 (or "none") means
 * "checked, and nobody was buying (or selling)", and shows as "None". Outside admin mode, and where there
 * can't be a price (see PlayerPrice), it's the normal read-only cell.
 *
 * Props:
 *   item  - one entry from loot.json
 *   field - "avgVend" or "avgWhobuy"
 */
export default function PriceCell({ item, field }) {
  const { enabled } = useAdmin();
  const noPrice = !isTradeable(item) || isSoldByNpc(item) || (field === 'avgWhobuy' && !hasWhobuy(item));
  if (!enabled || noPrice) return <PlayerPrice item={item} field={field} />;
  return <PriceInput item={item} field={field} />;
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
      label={`${field === 'avgVend' ? 'Vend' : 'Whobuy'} price for ${item.name}`}
      noneHint={`nobody ${field === 'avgWhobuy' ? 'buying' : 'selling'}`}
      advance={advance}
    />
  );
}
