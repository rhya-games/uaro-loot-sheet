import { ActionBadges, CategoryBadges } from './ItemBadges.jsx';
import ItemUses from './ItemUses.jsx';
import RowActions from './RowActions.jsx';
import { NpcBuyable, PlayerPrice } from './StatusIcons.jsx';
import VerifiedText from './VerifiedText.jsx';
import NpcSellPrice from './NpcSellPrice.jsx';
import { OVERCHARGE_LEVEL } from '../utils/prices.js';

/**
 * One loot item shown as a card: name, what to do with it, what it's for,
 * and prices. Used on small screens (see ItemList).
 *
 * Props:
 *   item        - one entry from src/data/loot.json
 *   onSelectUse - called when a "Used For" target is clicked
 *   highlightUses - which "Used For" entries to bring forward (see ItemUses)
 */
export default function ItemCard({ item, onSelectUse, highlightUses }) {
  return (
    <article className="panel p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-fg">
          {item.name}
          <span className="ml-2 text-sm font-normal text-muted">
            {item.itemType}
            {item.itemId && ` · #${item.itemId}`}
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-1">
          <ActionBadges actions={item.actions} />
          <span className="ml-2">
            <RowActions item={item} />
          </span>
        </div>
      </header>

      {item.categories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          <CategoryBadges categories={item.categories} />
        </div>
      )}

      <div className="mt-2 text-sm">
        <ItemUses item={item} onSelectUse={onSelectUse} highlight={highlightUses} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-line-faint pt-3 text-xs sm:grid-cols-5">
        <Stat label="Avg. vend" value={<PlayerPrice item={item} field="avgVend" />} />
        <Stat label="Avg. whobuy" value={<PlayerPrice item={item} field="avgWhobuy" />} />
        <Stat label={`NPC (OC ${OVERCHARGE_LEVEL})`} value={<NpcSellPrice item={item} />} />
        <Stat label="NPC Shop" value={<NpcBuyable item={item} />} />
        <Stat label="Last verified" value={<VerifiedText item={item} />} />
      </dl>
    </article>
  );
}

/** One label/value pair in the price row. */
function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-body">{value}</dd>
    </div>
  );
}
