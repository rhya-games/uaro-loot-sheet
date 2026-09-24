import { useAdmin } from './AdminContext.jsx';
import { ActionBadge } from '../components/ItemBadges.jsx';
import Tooltip from '../components/Tooltip.jsx';

const sameActions = (a, b) => a.length === b.length && a.every((action) => b.includes(action));

/**
 * In admin mode, shows under the Action chips what src/utils/suggest.js
 * would pick from the prices. Hover or focus it to see why. Saving a price
 * takes the suggestion automatically (see AdminContext); "Use" is for
 * items whose suggestion changed because of other items' prices.
 *
 * Props:
 *   item - one entry from loot.json
 */
export default function SuggestedActions({ item }) {
  const { enabled, suggest, saveItem } = useAdmin();
  if (!enabled) return null;
  const { actions, reasons } = suggest(item);
  const matches = actions.length > 0 && sameActions(actions, item.actions);

  const hint = (
    <Tooltip text={reasons.join('\n') || 'No uses and no prices yet'} className="mt-2 flex">
      <span tabIndex={0} className="flex flex-wrap items-center gap-1 rounded text-xs text-muted">
        {matches ? (
          'Matches suggestion'
        ) : actions.length ? (
          <>
            Suggested:
            {/* Faded, so they don't read as the real actions. */}
            <span className="flex flex-wrap gap-1 opacity-60">
              {actions.map((action) => <ActionBadge key={action} action={action} />)}
            </span>
          </>
        ) : (
          'No suggestion yet'
        )}
      </span>
    </Tooltip>
  );
  if (matches || !actions.length) return hint;
  return (
    <div className="flex flex-wrap items-end gap-2">
      {hint}
      <button
        type="button"
        onClick={() => saveItem(item.id, { actions })}
        aria-label={`Use suggested actions for ${item.name}: ${actions.join(' and ')}`}
        className="button-small px-2 py-0.5 text-xs"
      >
        Use
      </button>
    </div>
  );
}
