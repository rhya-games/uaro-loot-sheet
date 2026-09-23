import { ActionBadges, CategoryBadges } from './ItemBadges.jsx';
import ItemUses from './ItemUses.jsx';
import { NPC_BUYABLE_LABELS } from '../utils/labels.js';
import { formatZeny } from '../utils/format.js';

/**
 * One loot item shown as a card: name, what to do with it, what it's for,
 * and prices. Used on small screens (see ItemList).
 *
 * Props:
 *   item        - one entry from src/data/loot.json
 *   onSelectUse - called when a "Used For" target is clicked
 */
export default function ItemCard({ item, onSelectUse }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">
          {item.name}
          <span className="ml-2 text-xs font-normal text-gray-400">
            {item.itemType}
            {item.itemId && ` · #${item.itemId}`}
          </span>
        </h2>
        <div className="flex flex-wrap gap-1">
          <ActionBadges actions={item.actions} />
        </div>
      </header>

      {item.categories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          <CategoryBadges categories={item.categories} />
        </div>
      )}

      <div className="mt-2 text-sm">
        <ItemUses item={item} onSelectUse={onSelectUse} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-xs sm:grid-cols-5">
        <Stat label="Avg. vend" value={formatZeny(item.avgVend)} />
        <Stat label="Avg. whobuy" value={formatZeny(item.avgWhobuy)} />
        <Stat label="NPC sell (OC 10)" value={formatZeny(item.npcSellPrice)} />
        <Stat label="Buy from NPC" value={NPC_BUYABLE_LABELS[item.npcBuyable] ?? '—'} />
        <Stat label="Last verified" value={item.lastVerified ?? 'Never'} title={item.verificationNotes} />
      </dl>
    </article>
  );
}

/** One label/value pair in the price row. */
function Stat({ label, value, title }) {
  return (
    <div title={title || undefined}>
      <dt className="text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-800">{value}</dd>
    </div>
  );
}
