/**
 * Shows what an item is used for, plus any extra notes.
 *   e.g. "x10 Mystic Rose · x6 Little Isis Pet Evolution"
 *
 * Each target is a button: clicking it shows every item used for that
 * target (via the "Used For" filter).
 *
 * Props:
 *   item        - one entry from loot.json
 *   onSelectUse - called with a target name, e.g. "Mystic Rose"
 */
export default function ItemUses({ item, onSelectUse }) {
  if (item.uses.length === 0 && !item.notes) return null;

  return (
    <div className="space-y-1 text-gray-700">
      {item.uses.length > 0 && (
        <ul className="flex flex-wrap gap-x-3 gap-y-0.5">
          {item.uses.map((use, index) => (
            <li key={`${use.for}-${index}`}>
              <span className="text-gray-500 tabular-nums">x{use.qty?.toLocaleString('en-US') ?? '?'}</span>{' '}
              <button
                type="button"
                onClick={() => onSelectUse(use.for)}
                title={`Show all items used for ${use.for}`}
                className="text-emerald-800 underline decoration-emerald-800/30 underline-offset-2 hover:decoration-emerald-800"
              >
                {use.for}
              </button>
            </li>
          ))}
        </ul>
      )}
      {item.notes && <p className="text-gray-600 italic">{item.notes}</p>}
    </div>
  );
}
