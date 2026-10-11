import { LockClosedIcon } from '@heroicons/react/24/outline';
import HowToSteps from '../components/HowToSteps.jsx';
import { CategoryBadge } from '../components/ItemBadges.jsx';
import { BulletList, ExternalLink, Page, PageLink, Section, SubHeading } from '../components/Page.jsx';
import { Mark, NoIcon, Unknown, YesIcon } from '../components/StatusIcons.jsx';
import { ALL_CATEGORIES, ALL_ITEM_TYPES, CATEGORY_DESCRIPTIONS, CATEGORY_LINKS } from '../utils/labels.js';
import { ROUTES } from '../utils/route.js';
import { CONTRIBUTING_URL } from '../config.js';
import { OVERCHARGE_LEVEL, OVERCHARGE_PERCENT } from '../utils/prices.js';

/** What the site is, how to use it, how to read it, and where the data comes from. */
export default function AboutPage() {
  return (
    <Page title="About" intro="Rhya's Loot Sheet: quickly see what to do with your loot on uaRO.">
      <Section title="What this is">
        <p>
          Search for an item to see whether to keep it, sell it to players, or sell it to an NPC, and which quests,
          hats and pet evolutions need it.
        </p>
        <p className="text-muted">
          It started as Rhya's Google Sheet and is now an open-source site anyone can help keep up to date.
        </p>
      </Section>

      <Section title="How to use it">
        <HowToSteps />
      </Section>

      <Section title="Reading the table">
        <SubHeading>Columns</SubHeading>
        <Legend>
          <Row term="Item Name">Its name, type ({ALL_ITEM_TYPES.join(', ')}) and item ID. Click the ID to copy it.</Row>
          <Row term="Action">What to do with it. See step 2 above.</Row>
          <Row term="Category">What kind of content it belongs to (below).</Row>
          <Row term="Used For">How many you need, and for what. Click one to see every item it needs.</Row>
          <Row term="Vend">Average price players sell it for in vending shops.</Row>
          <Row term="Whobuy">Average price players pay for it through @whobuy.</Row>
          <Row term="NPC">
            Zeny an NPC pays for one, with Overcharge level {OVERCHARGE_LEVEL} (+{OVERCHARGE_PERCENT}%).
          </Row>
          <Row term="NPC Shop">Whether you can buy it from an NPC shop.</Row>
          <Row term="Verified">When the vend or @whobuy price was last checked on the live server.</Row>
        </Legend>

        <SubHeading>Marks</SubHeading>
        <Legend>
          <Row term={<Mark><Unknown /></Mark>}>The price hasn’t been verified yet.</Row>
          <Row term={<Mark><NoIcon label="Can't be sold this way" /></Mark>}>
            In Vend and Whobuy: it can’t be sold that way. NPCs sell it, it can’t be traded, or it’s a card or
            equipment (@whobuy doesn’t buy those). In NPC: NPCs won’t buy it.
          </Row>
          <Row term={<Mark>No sellers</Mark>}>
            In Vend: no vending shop was selling it when checked in game.
          </Row>
          <Row term={<Mark>No buyers</Mark>}>
            In Whobuy: no player was buying it when checked in game.
          </Row>
          <Row term={<Mark>None</Mark>}>Nothing uses the item.</Row>
          <Row term={
            <Mark>
              <LockClosedIcon className="size-5" aria-hidden="true" />
            </Mark>
          }>
            uaRO set a fixed NPC price that Overcharge doesn’t raise.
          </Row>
          <Row term={<Mark><YesIcon label="Yes" /></Mark>}>NPC Shop: an NPC shop sells it.</Row>
        </Legend>

        <SubHeading>Categories</SubHeading>
        <Legend>
          {/* "Not Reviewed" is only for the people editing the data, so it's never listed here. */}
          {ALL_CATEGORIES.filter((category) => category !== 'Not Reviewed').map((category) => (
            <Row key={category} term={<CategoryBadge category={category} />}>
              {CATEGORY_DESCRIPTIONS[category]}
              {CATEGORY_LINKS[category] && (
                <>
                  {' '}
                  <ExternalLink href={CATEGORY_LINKS[category].href}>{CATEGORY_LINKS[category].label}</ExternalLink>
                </>
              )}
            </Row>
          ))}
        </Legend>
      </Section>

      <Section title="Tips">
        <BulletList>
          <li>
            <strong>Sort:</strong> click a column header. Click again to reverse, and a third time to reset.
          </li>
          <li>
            <strong>Zeny only:</strong> untick everything under “I keep items for” in the filters.
          </li>
          <li>
            <strong>Categories:</strong> use “Select all” under Category, then untick the ones you don’t care about.
          </li>
          <li>
            <strong>Share:</strong> the page’s address holds your search, filters and sort. Click Share to send exactly
            what you’re looking at. Your last search and filters come back on your next visit.
          </li>
        </BulletList>
      </Section>

      <Section title="Where the data comes from">
        <BulletList>
          <li>Rhya's original loot sheet and her in-game checks.</li>
          <li>
            Item IDs, types, NPC prices and shops: the{' '}
            <ExternalLink href="https://github.com/HerculesWS/Hercules">Hercules emulator</ExternalLink>, which has
            both pre-renewal and renewal data.
          </li>
          <li>
            Server-specific quests, pet evolutions and{' '}
            <ExternalLink href="https://wiki.uaro.net/Modified_Sales_Prices/">modified NPC prices</ExternalLink>: the{' '}
            <ExternalLink href="https://wiki.uaro.net/">uaRO wiki</ExternalLink>.
          </li>
        </BulletList>
      </Section>

      <Section title="Privacy">
        <p>
          The site counts visits and how it's used (pages opened, searches, filters, buttons clicked) with{' '}
          <ExternalLink href="https://umami.is">Umami</ExternalLink>, to learn what to improve. It uses no cookies and
          doesn't know who you are.
        </p>
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

/**
 * A list with the name on the left and what it means on the right. Rows are
 * separated by thin lines and given room, so each one reads on its own.
 */
function Legend({ children }) {
  return <dl className="divide-y divide-line-faint rounded-lg border border-line-faint text-sm">{children}</dl>;
}

/** One row of a Legend. `term` can be text or a mark. */
function Row({ term, children }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-start gap-x-4 px-4 py-3 sm:grid-cols-[8rem_1fr]">
      <dt className="font-semibold text-fg">{term}</dt>
      <dd className="leading-relaxed">{children}</dd>
    </div>
  );
}
