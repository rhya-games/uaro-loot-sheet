import Badge from './Badge.jsx';
import { ACTIONS, FALLBACK_ACTION } from '../utils/labels.js';

/**
 * Colored badges for an item's actions (Keep, Vend, NPC, ...).
 * Hovering a badge shows what the action means.
 */
export function ActionBadges({ actions }) {
  if (actions.length === 0) return <Badge>No action yet</Badge>;
  return actions.map((action) => {
    const style = ACTIONS[action] ?? FALLBACK_ACTION;
    return (
      <Badge key={action} className={style.className} title={style.description}>
        {action}
      </Badge>
    );
  });
}

/** Gray badges for an item's categories. */
export function CategoryBadges({ categories }) {
  return categories.map((category) => (
    <Badge key={category} className="bg-gray-100 text-gray-600">
      {category}
    </Badge>
  ));
}
