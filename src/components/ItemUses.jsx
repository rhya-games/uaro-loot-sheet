import Tooltip from './Tooltip.jsx';

/**
 * Shows what an item is used for, plus any extra notes.
 *   e.g. "x10 Mystic Rose  x6 Little Isis Pet Evolution  x10 Veins Siblings Quest (each try)"
 *
 * Each use reads as one line of text ("x500 Sweet Drops Pet Evolution") that
 * wraps like a normal sentence. Clicking the target shows every item used
 * for it (via the "Used For" filter).
 *
 * Props:
 *   item        - one entry from loot.json
 *   onSelectUse - called with a target name, e.g. "Mystic Rose"
 */
export default function ItemUses({ item, onSelectUse }) {
  if (item.uses.length === 0 && !item.notes) return null;

  return (
    <div className="space-y-1 text-body">
      {item.uses.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {item.uses.map((use, index) => (
            <li key={`${use.for}-${index}`}>
              <span className="text-subtle-fg tabular-nums">x{use.qty?.toLocaleString('en-US') ?? '?'}</span>{' '}
              <Tooltip text="Show all items used for this" className="">
                <InlineButton onClick={() => onSelectUse(use.for)}>{use.for}</InlineButton>
              </Tooltip>
              {use.note && <span className="text-subtle-fg"> ({use.note})</span>}
            </li>
          ))}
        </ul>
      )}
      {item.notes && <p className="text-muted">{item.notes}</p>}
    </div>
  );
}

/**
 * A button that wraps like normal text. Real <button>s can't do that
 * (browsers always draw them as a box), so this is a <span> that behaves
 * like a button: focusable, announced as a button, and works with Enter and
 * Space. This is the standard ARIA "button" pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
function InlineButton({ onClick, children, ...rest }) {
  return (
    <span
      {...rest}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer text-accent underline decoration-accent/30 underline-offset-2 [box-decoration-break:clone]
        hover:decoration-accent"
    >
      {children}
    </span>
  );
}
