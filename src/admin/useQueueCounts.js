import { useMemo } from 'react';
import { useAdmin } from './useAdmin.js';
import { queueCounts, targetsNeedingValue } from './queues.js';

/** How many items each admin tool has waiting: { 'needs-price': 420, ..., targets: 178 }. */
export function useQueueCounts() {
  const { items, suggest, targets, reviewed } = useAdmin();
  return useMemo(
    () => ({ ...queueCounts(items, { suggest, reviewed }), targets: targetsNeedingValue(items, targets) }),
    [items, suggest, targets, reviewed],
  );
}
