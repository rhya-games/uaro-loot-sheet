import Badge from './Badge.jsx';
import { ACTIONS, FALLBACK_ACTION, categoryStyle } from '../utils/labels.js';

/**
 * Dark chips for an item's actions (Keep, Vend, NPC, ...).
 * What each action means is explained on the About page (chips aren't
 * focusable, so they don't get tooltips).
 */
export function ActionBadges({ actions }) {
  if (actions.length === 0) return '—'; // Same blank marker as the price columns.
  return actions.map((action) => <ActionBadge key={action} action={action} />);
}

/** One action chip. */
export function ActionBadge({ action }) {
  const style = ACTIONS[action] ?? FALLBACK_ACTION;
  return (
    <Badge className={style.className}>{action}</Badge>
  );
}

/** Rainbow-colored chips for an item's categories. */
export function CategoryBadges({ categories }) {
  return categories.map((category) => <CategoryBadge key={category} category={category} />);
}

/** One category chip. */
export function CategoryBadge({ category }) {
  return (
    <Badge style={categoryStyle(category)}>
      {category}
    </Badge>
  );
}
