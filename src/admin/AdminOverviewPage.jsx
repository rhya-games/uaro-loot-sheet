import AdminLayout from './AdminLayout.jsx';
import { adminEntries } from './adminPages.js';
import { useQueueCounts } from './useQueueCounts.js';
import { ROUTES } from '../utils/route.js';

/**
 * Admin mode's front page: every tool with how many items are waiting
 * (see queues.js and useQueueCounts). Tools with a page link to it; the
 * rest show their count but can't be opened yet.
 *
 * Only exists under `npm run dev`.
 */
export default function AdminOverviewPage() {
  const counts = useQueueCounts();

  return (
    <AdminLayout title="Admin" intro="Lists of items that need a look. Work through a list, and its count goes down.">
      <section className="panel overflow-hidden">
        <ul>
          {adminEntries().map((entry, index) => (
            <li key={entry.id} className={`flex items-center justify-between gap-4 px-4 py-3 ${index ? 'border-t border-line' : ''}`}>
              <div>
                <h2 className="font-semibold text-fg">
                  {entry.route ? (
                    <a
                      href={ROUTES[entry.route]}
                      className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
                    >
                      {entry.title}
                    </a>
                  ) : (
                    entry.title
                  )}
                </h2>
                <p className="text-sm text-muted">
                  {entry.description}
                  {!entry.route && ' No page yet.'}
                </p>
              </div>
              <p className={`text-xl font-semibold tabular-nums ${counts[entry.id] ? 'text-fg' : 'text-muted'}`}>
                {counts[entry.id]}
                <span className="sr-only"> waiting</span>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </AdminLayout>
  );
}
