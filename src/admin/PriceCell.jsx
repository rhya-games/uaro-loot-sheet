import { useAdmin } from './useAdmin.js';
import ZenyInput from './ZenyInput.jsx';
import { priceChanges } from './verify.js';
import { PlayerPrice, VendStar } from '../components/StatusIcons.jsx';
import { isSoldByNpc, isTradeable } from '../utils/prices.js';

/**
 * A vend price cell. In admin mode it's a text box: type a price
 * and press Enter (or leave the box) to save it. That also marks the item
 * as verified today. Escape puts the old price back. 0 (or "none") means
 * "checked, and nobody was selling". Outside admin mode the cell is the star
 * (see VendStar), and where there can't be a price (see PlayerPrice) it's the
 * normal read-only cell.
 *
 * Props:
 *   item  - one entry from loot.json
 *   field - "avgVend"
 */
export default function PriceCell({ item, field }) {
  const { enabled } = useAdmin();
  if (!enabled) return <VendStar item={item} />;
  const noPrice = !isTradeable(item) || isSoldByNpc(item);
  if (noPrice) return <PlayerPrice item={item} />;
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
      label={`Vend price for ${item.name}`}
      noneHint="nobody selling"
      advance={advance}
    />
  );
}
