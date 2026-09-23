import { BulletList, ExternalLink, Page, PageLink, Section, SubHeading } from '../components/Page.jsx';
import { GITHUB_REPO_URL } from '../config.js';
import { ROUTES } from '../utils/route.js';

const DATA_FILE_URL = `${GITHUB_REPO_URL}/blob/main/src/data/loot.json`;
const CONTRIBUTING_URL = `${GITHUB_REPO_URL}/blob/main/CONTRIBUTING.md`;

/** A code example block. */
function Code({ children }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm leading-relaxed text-gray-100">
      <code>{children}</code>
    </pre>
  );
}

/** How to help keep the data up to date, written for non-programmers. */
export default function ContributePage() {
  return (
    <Page title="Contribute" intro="All item data lives in one file anyone can edit. No coding needed.">
      <Section title="Ways to help">
        <BulletList>
          <li>
            <strong>Check prices in game</strong> and update Vend, Whobuy, and the Verified date.
          </li>
          <li>
            <strong>Fill in gaps</strong>: items with no action, missing item IDs, or uses that aren't listed yet.
          </li>
          <li>
            <strong>Report problems</strong> if you'd rather not edit anything yourself. See{' '}
            <PageLink href={ROUTES.feedback}>Feedback</PageLink>.
          </li>
        </BulletList>
      </Section>

      <Section title="Edit the data on GitHub">
        <p>You only need a free GitHub account.</p>
        <ol className="list-decimal space-y-1.5 pl-5 marker:text-gray-500">
          <li>
            Open <ExternalLink href={DATA_FILE_URL}>src/data/loot.json</ExternalLink> and click the pencil icon
            (Edit).
          </li>
          <li>Find the item (Ctrl+F / Cmd+F) and change what you need.</li>
          <li>
            Click <strong>Commit changes</strong>, describe what you changed, and choose{' '}
            <strong>Create a pull request</strong>.
          </li>
          <li>Your change is checked automatically. If something's wrong, the check explains what to fix.</li>
        </ol>
      </Section>

      <Section title="What an item looks like">
        <Code>{`{
  "id": "2carat-diamond",
  "name": "2carat Diamond",
  "itemId": 731,
  "itemType": "Misc",
  "actions": ["NPC", "Keep"],
  "categories": ["Official Hat Quest"],
  "uses": [{ "for": "Mystic Rose", "qty": 10 }],
  "notes": "",
  "links": [],
  "avgVend": null,
  "avgWhobuy": null,
  "npcSellPrice": 15500,
  "npcBuyable": "no",
  "lastVerified": "2026-09-23",
  "verificationNotes": "Checked NPC price with Overcharge 10"
}`}</Code>

        <SubHeading>Rules the check enforces</SubHeading>
        <BulletList>
          <li>
            Numbers have no commas or quotes: <code className="font-mono">15500</code>, not{' '}
            <code className="font-mono">"15,500"</code>. Unknown values are <code className="font-mono">null</code>.
          </li>
          <li>
            Actions: <code className="font-mono">Keep</code>, <code className="font-mono">Vend</code>,{' '}
            <code className="font-mono">Whobuy</code>, <code className="font-mono">NPC</code>.
          </li>
          <li>If an NPC sells the item, use NPC instead of Vend or Whobuy.</li>
          <li>Cards can't be bought from NPCs.</li>
          <li>
            Every item needs at least one category. Use <code className="font-mono">"Uncategorized"</code> if none
            fit.
          </li>
          <li>Spell each "Used For" target the same way everywhere so the filter groups them.</li>
          <li>
            Dates are <code className="font-mono">YYYY-MM-DD</code>. Update <code className="font-mono">lastVerified</code>{' '}
            when you check something in game.
          </li>
        </BulletList>
      </Section>

      <Section title="Working on your computer">
        <p>
          If you're comfortable with a terminal, the{' '}
          <ExternalLink href={CONTRIBUTING_URL}>full contributing guide</ExternalLink> explains how to run the site
          locally and check your changes before sending them.
        </p>
        <Code>{`npm install
npm run dev        # run the site at http://localhost:5173/uaro-loot-sheet/
npm run validate   # check loot.json for mistakes`}</Code>
      </Section>

      <Section title="Wording">
        <p>
          When referring to the original game, say <strong>Official</strong> (e.g. "Official Hat Quest") or{' '}
          <strong>Game</strong>.
        </p>
      </Section>
    </Page>
  );
}
