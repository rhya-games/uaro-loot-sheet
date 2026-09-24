import { ActionBadge, CategoryBadge } from '../components/ItemBadges.jsx';
import { BulletList, ExternalLink, Page, PageLink, Section, SubHeading } from '../components/Page.jsx';
import { ACTIONS, ALL_ACTIONS, ALL_CATEGORIES, ALL_ITEM_TYPES } from '../utils/labels.js';
import { ROUTES } from '../utils/route.js';
import { CONTRIBUTING_URL } from '../config.js';
import { OVERCHARGE_LEVEL, OVERCHARGE_PERCENT } from '../utils/prices.js';

/** What the site is, how to read it, and where the data comes from. */
export default function AboutPage() {
  return (
    <Page title="About">
      <Section title="What this is">
        <p>
          A quick lookup for loot on the uaRO server: search for an item to see whether to keep it, sell it to
          players, or sell it to an NPC, and what quests, hats, and pet evolutions need it.
        </p>
        <p>It started as Rhya's Google Sheet and is now an open-source site anyone can help keep up to date.</p>
      </Section>

      <Section title="Reading the table">
        <SubHeading>Actions: what to do with it</SubHeading>
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

        <SubHeading>Categories: what it's used for</SubHeading>
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

        <SubHeading>Other columns</SubHeading>
        <BulletList>
          <li>
            <strong>Item Type</strong>: {ALL_ITEM_TYPES.join(', ')}.
          </li>
          <li>
            <strong>Used For</strong>: how many you need and for what. Click one to see every item it needs.
          </li>
          <li>
            <strong>Vend</strong>: average price players sell it for in vending shops.
          </li>
          <li>
            <strong>Whobuy</strong>: average price players pay for it through @whobuy.
          </li>
          <li>
            <strong>NPC Sell</strong>: zeny an NPC pays for one with Overcharge level {OVERCHARGE_LEVEL} (+
            {OVERCHARGE_PERCENT}%). Base prices and the bonus come from the Hercules emulator.
          </li>
          <li>
            <strong>NPC Buy</strong>: whether an NPC sells it.
          </li>
          <li>
            <strong>Verified</strong>: when someone last checked the entry on the live server.
          </li>
        </BulletList>

        <SubHeading>Tips</SubHeading>
        <BulletList>
          <li>Click a column header to sort by it. Click again to reverse, and a third time to reset.</li>
          <li>
            Don't do quests? Turn on <strong>I don't keep items</strong> in the filters to see only what to sell.
          </li>
          <li>
            Use <strong>Select all</strong> under Category, then untick the ones you don't care about.
          </li>
        </BulletList>
      </Section>

      <Section title="Where the data comes from">
        <BulletList>
          <li>Rhya's original loot sheet and in-game checks by players.</li>
          <li>
            Item IDs and types from the{' '}
            <ExternalLink href="https://github.com/HerculesWS/Hercules">Hercules emulator</ExternalLink> (pre-renewal).
          </li>
          <li>
            Server-specific quests and pet evolutions from the{' '}
            <ExternalLink href="https://wiki.uaro.net/">uaRO wiki</ExternalLink>.
          </li>
        </BulletList>
      </Section>

      <Section title="Found a mistake or want to help?">
        <p>
          See <PageLink href={ROUTES.feedback}>Feedback</PageLink> for ways to report problems, or read the{' '}
          <ExternalLink href={CONTRIBUTING_URL}>contributing guide</ExternalLink> to edit the data yourself.
        </p>
        <p>
          Want to support this work? You can mail in-game hat quest materials to <strong>Rhya</strong> the Sniper.
          Cheers!
        </p>
      </Section>
    </Page>
  );
}
