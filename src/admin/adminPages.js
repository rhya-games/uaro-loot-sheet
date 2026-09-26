import { QUEUES } from './queues.js';

/**
 * Which admin page shows each queue (a route name from utils/route.js).
 * Queues with no page yet still get a count on the overview. Add a queue's
 * page here when it's built.
 */
const QUEUE_ROUTES = { 'needs-price': 'adminPrices', 'unverified-prices': 'adminVerify' };

/** The Targets page isn't a queue of items, but it works like one. */
const TARGETS = {
  id: 'targets',
  title: 'Target values',
  description: 'What finished things are worth. Decides which parts are worth keeping.',
  route: 'targets',
};

/**
 * Every admin tool, in the order to show them: { id, title, description, route }.
 * `route` is null when the tool has no page yet. `id` is the key of its count
 * in useQueueCounts().
 *
 * A function, not a list built when the file loads: that keeps this file
 * (and queues.js) out of the published build, where nothing calls it.
 */
export function adminEntries() {
  return QUEUES.flatMap((queue) => {
    const entry = { id: queue.id, title: queue.title, description: queue.description, route: QUEUE_ROUTES[queue.id] ?? null };
    return queue.id === 'suspicious-values' ? [entry, TARGETS] : [entry];
  });
}
