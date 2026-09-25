import { useAdmin } from './useAdmin.js';
import ZenyInput from './ZenyInput.jsx';
import { todayText } from '../utils/format.js';
import { PlayerPrice } from '../components/StatusIcons.jsx';
import { hasWhobuy, isSoldByNpc, isTradeable } from '../utils/prices.js';

/** What the Verified note says for a price checked in game. */
const CHECK_NOTES = {
  avgVend: 'Vend price from a player shop',
  avgWhobuy: '@whobuy price in game',
};

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

function PriceInput({ item, field }) {
  const { saveItem } = useAdmin();

  // Saving a price also marks the item as verified today. Clearing a price
  // isn't a check in game, so it doesn't touch Verified.
  function save(value) {
    const changes = { [field]: value };
    if (value != null) {
      const note = CHECK_NOTES[field];
      const earlierToday = item.lastVerified === todayText() && item.verificationNotes && !item.verificationNotes.includes(note);
      Object.assign(changes, {
        lastVerified: todayText(),
        verificationNotes: earlierToday ? `${item.verificationNotes}; ${note}` : note,
      });
    }
    return saveItem(item.id, changes);
  }

  return (
    <ZenyInput
      value={item[field]}
      onSave={save}
      label={`${field === 'avgVend' ? 'Vend' : 'Whobuy'} price for ${item.name}`}
      noneHint={`nobody ${field === 'avgWhobuy' ? 'buying' : 'selling'}`}
    />
  );
}
