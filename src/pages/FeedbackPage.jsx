import { BulletList, ExternalLink, Page, PageLink, Section } from '../components/Page.jsx';
import { CONTRIBUTING_URL, DISCORD_FEEDBACK_THREAD_URL, GENERAL_ISSUE_URL } from '../config.js';
import { ROUTES } from '../utils/route.js';

/** Jump links beside the page. The Discord entry only exists when the thread link is set. */
const CONTENTS = [
  { id: 'item', title: 'Report an item problem' },
  { id: 'discord', title: 'Discord' },
  { id: 'github', title: 'GitHub issues' },
  { id: 'fix', title: 'Fix it yourself' },
  { id: 'include', title: 'What to include' },
].filter((entry) => entry.id !== 'discord' || DISCORD_FEEDBACK_THREAD_URL);

/** Every way to report a problem or share an idea, and when to use each. */
export default function FeedbackPage() {
  return (
    <Page contents={CONTENTS} title="Feedback" intro="Spotted a wrong price, a missing item, or have an idea? Here's how to tell us.">
      <Section id="item" title="Report a problem with one item">
        <p>
          On the <PageLink href={ROUTES.loot}>Loot Sheet</PageLink>, point at the item's row and click the <strong>flag</strong>
          (Report Issue) that appears in the Verified column. It opens a short GitHub form with the item already filled in.
        </p>
        <p className="text-muted">Best for: wrong actions, categories, uses, or prices. Needs a free GitHub account.</p>
      </Section>

      {DISCORD_FEEDBACK_THREAD_URL && (
        <Section id="discord" title="Discord feedback thread">
          <p>
            Post in the <ExternalLink href={DISCORD_FEEDBACK_THREAD_URL}>loot sheet feedback thread</ExternalLink> on
            Discord.
          </p>
          <p className="text-muted">Best for: quick questions, suggestions, and anything you'd like to discuss.</p>
        </Section>
      )}

      <Section id="github" title="GitHub issues">
        <p>
          <ExternalLink href={GENERAL_ISSUE_URL}>Open an issue on GitHub</ExternalLink> for bugs in the site itself or
          ideas for new features.
        </p>
        <p className="text-muted">Best for: things that aren't about one item. Needs a free GitHub account.</p>
      </Section>

      <Section id="fix" title="Help fix it yourself">
        <p>
          All item data lives in one file anyone can edit, no coding needed. The{' '}
          <ExternalLink href={CONTRIBUTING_URL}>contributing guide</ExternalLink> walks you through changing it on
          GitHub, step by step.
        </p>
        <p className="text-muted">Best for: when you know the right answer and want it fixed quickly.</p>
      </Section>

      <Section id="include" title="What to include">
        <BulletList>
          <li>The item name (and item ID if you know it).</li>
          <li>What's wrong and what it should say instead.</li>
          <li>How you know: the date you checked in game, a uaRO wiki link, or the vend prices you saw.</li>
        </BulletList>
      </Section>
    </Page>
  );
}
