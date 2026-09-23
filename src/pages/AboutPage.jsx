import { ActionBadge, CategoryBadge } from '../components/ItemBadges.jsx';
import { ACTIONS, ALL_ACTIONS, ALL_CATEGORIES, ALL_ITEM_TYPES } from '../utils/labels.js';
import { DISCORD_URL, GENERAL_ISSUE_URL, GITHUB_REPO_URL } from '../config.js';

/** Link that opens in a new tab, and says so to screen readers. */
function ExternalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-emerald-800 underline decoration-emerald-800/30 underline-offset-2 hover:decoration-emerald-800"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** One titled block of the About page. */
function Section({ title, children }) {
  return (
    <section className="panel space-y-3 p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

/** What the site is, how to read it, where the data comes from, and how to help. */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 text-gray-700">
      <h1 className="text-2xl font-bold text-gray-900">About</h1>

      <Section title="What this is">
        <p>
          A quick lookup for loot on the uaRO server: search for an item to see whether to keep it, sell it to
          players, or sell it to an NPC, and what quests, hats, and pet evolutions need it.
        </p>
        <p>It started as Rhya's Google Sheet and is now an open-source site anyone can help keep up to date.</p>
      </Section>

      <Section title="Reading the table">
        <h3 className="font-semibold text-gray-900">Actions: what to do with it</h3>
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
          {ALL_ACTIONS.map((action) => (
            <div key={action} className="contents">
              <dt>
                <ActionBadge action={action} />
              </dt>
              <dd>{ACTIONS[action]?.description}</dd>
            </div>
          ))}
        </dl>

        <h3 className="pt-2 font-semibold text-gray-900">Categories: what it's used for</h3>
        <ul className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map((category) => (
            <li key={category}>
              <CategoryBadge category={category} />
            </li>
          ))}
        </ul>
        <p>
          <strong>Official</strong> means content from the original game. <strong>Server</strong> and{' '}
          <strong>uaRO</strong> mean content added by this server.
        </p>

        <h3 className="pt-2 font-semibold text-gray-900">Other columns</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Item Type</strong>: {ALL_ITEM_TYPES.join(', ')}.
          </li>
          <li>
            <strong>Used For</strong>: how many you need and for what. Click one to see every item it needs.
          </li>
          <li>
            <strong>Vend / Whobuy</strong>: average player prices. <strong>NPC Sell</strong>: what an NPC pays with
            Overcharge level 10. <strong>NPC Buy</strong>: whether an NPC sells it.
          </li>
          <li>
            <strong>Verified</strong>: when someone last checked the entry on the live server.
          </li>
          <li>Click a column header to sort by it. Click again to reverse, and a third time to reset.</li>
        </ul>
      </Section>

      <Section title="Where the data comes from">
        <ul className="list-disc space-y-1 pl-5">
          <li>Rhya's original loot sheet and in-game checks by players.</li>
          <li>
            Item IDs and types from the <ExternalLink href="https://github.com/HerculesWS/Hercules">Hercules emulator</ExternalLink>{' '}
            (pre-renewal).
          </li>
          <li>
            Server-specific quests and pet evolutions from the{' '}
            <ExternalLink href="https://wiki.uaro.net/">uaRO wiki</ExternalLink>.
          </li>
        </ul>
      </Section>

      <Section title="Found a mistake?">
        <p>Prices change and quests get updated, so reports are very welcome.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Use the <strong>Report</strong> link under any item's name. It opens a GitHub form with the item already
            filled in.
          </li>
          {DISCORD_URL && (
            <li>
              Or message Rhya on <ExternalLink href={DISCORD_URL}>Discord</ExternalLink>.
            </li>
          )}
          <li>
            For anything else (bugs, ideas), <ExternalLink href={GENERAL_ISSUE_URL}>open an issue on GitHub</ExternalLink>.
          </li>
        </ul>
      </Section>

      <Section title="Help out">
        <p>
          The item data is one file anyone can edit, no coding needed. See the{' '}
          <ExternalLink href={`${GITHUB_REPO_URL}/blob/main/CONTRIBUTING.md`}>contributing guide</ExternalLink>.
        </p>
        <p>
          Want to support this work? You can mail in-game hat quest materials to <strong>Rhya</strong> the Sniper.
          Cheers!
        </p>
      </Section>
    </div>
  );
}
