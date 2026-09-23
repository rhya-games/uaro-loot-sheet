import Badge from './Badge.jsx';
import { ACTIONS, CATEGORY_COLORS, FALLBACK_ACTION, FALLBACK_CATEGORY_COLOR } from '../utils/labels.js';

/**
 * Colored pill badges for an item's actions (Keep, Vend, NPC, ...).
 * Hovering a badge shows what the action means.
 */
export function ActionBadges({ actions }) {
  if (actions.length === 0) return '—'; // Same blank marker as the price columns.
  return actions.map((action) => <ActionBadge key={action} action={action} />);
}

/** One action pill. */
export function ActionBadge({ action }) {
  const style = ACTIONS[action] ?? FALLBACK_ACTION;
  return (
    <Badge className={style.className} title={style.description}>
      {action}
    </Badge>
  );
}

/** Colored tag badges for an item's categories. */
export function CategoryBadges({ categories }) {
  return categories.map((category) => <CategoryBadge key={category} category={category} />);
}

/** One category tag. */
export function CategoryBadge({ category }) {
  return (
    <Badge shape="tag" className={CATEGORY_COLORS[category] ?? FALLBACK_CATEGORY_COLOR}>
      {category}
    </Badge>
  );
}
