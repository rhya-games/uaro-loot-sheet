import { Page, Section, SubHeading } from '../components/Page.jsx';
import { CHANGELOG, CHANGE_TYPES } from '../data/changelog.js';

/** Colored label next to each change type, e.g. "Added". */
const TYPE_COLORS = {
  Added: 'text-green-800',
  Changed: 'text-blue-800',
  Fixed: 'text-amber-800',
  Removed: 'text-red-800',
};

/** "2026-09-23" -> "September 23, 2026" (in any time zone). */
function formatDate(dateText) {
  const [year, month, day] = dateText.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Site and data updates, newest first. Entries live in src/data/changelog.js. */
export default function ChangelogPage() {
  return (
    <Page title="Changelog" intro="What's new on the site and in the item data, newest first.">
      {CHANGELOG.length === 0 && <p>No updates yet.</p>}
      {CHANGELOG.map((entry) => (
        <Section key={`${entry.date}-${entry.title}`} title={entry.title}>
          <p className="text-gray-600">
            <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          </p>
          {CHANGE_TYPES.map((type) => {
            const changes = entry.changes.filter((change) => change.type === type);
            if (changes.length === 0) return null;
            return (
              <div key={type}>
                <SubHeading>
                  <span className={TYPE_COLORS[type]}>{type}</span>
                </SubHeading>
                <ul className="mt-1 list-disc space-y-1.5 pl-5 marker:text-gray-400">
                  {changes.map((change) => (
                    <li key={change.text}>{change.text}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Section>
      ))}
    </Page>
  );
}
