import { ActionBadge } from './ItemBadges.jsx';
import { Mark, NoIcon, Unknown } from './StatusIcons.jsx';
import { ACTIONS, ALL_ACTIONS } from '../utils/labels.js';

/**
 * The four numbered "how to use the sheet" steps. Shared by the welcome box
 * (WelcomeDialog) and the About page, so they always say the same thing.
 */
export default function HowToSteps() {
  return (
    <ol className="space-y-5 text-sm">
      <Step number={1} title="Find your item">
        <p>
          Type a name, a use (a quest, hat or pet) or an item ID in the search box. Click a use in the “Used For”
          column to see every item it needs.
        </p>
      </Step>

      <Step number={2} title="Read the Action">
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5">
          {ALL_ACTIONS.map((action) => (
            <div key={action} className="contents">
              <dt>
                <ActionBadge action={action} />
              </dt>
              <dd>{ACTIONS[action]?.description}</dd>
            </div>
          ))}
        </dl>
      </Step>

      <Step number={3} title="Say what you keep items for">
        <p>
          Open “Show filters”, and under “I keep items for” untick what you don’t do. Items only needed for those
          show how to sell them instead.
        </p>
      </Step>

      <Step number={4} title="Check the prices">
        <ul className="space-y-1.5">
          <li>Vend and Whobuy are what players pay. NPC is what an NPC pays you.</li>
          <li className="flex items-center gap-2">
            <Mark>
              <Unknown />
            </Mark>{' '}
            The price hasn’t been verified yet.
          </li>
          <li className="flex items-center gap-2">
            <Mark>
              <NoIcon label="Can't be sold this way" />
            </Mark>{' '}
            It can’t be sold that way.
          </li>
        </ul>
      </Step>
    </ol>
  );
}

/** One numbered step: a number badge, a title and its content. */
function Step({ number, title, children }) {
  return (
    <li className="flex gap-3">
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-control text-xs font-semibold text-white"
        aria-hidden="true"
      >
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-fg">{title}</h3>
        <div className="mt-1 text-body">{children}</div>
      </div>
    </li>
  );
}
