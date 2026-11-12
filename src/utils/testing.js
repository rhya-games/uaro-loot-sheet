import { vendFlag } from './prices.js';

/**
 * For tests: gives a made-up item the `vend` flag its price works out to,
 * unless the test sets `vend` itself. In the real data `vend` is set by hand
 * (the price is only extra information), so a test that wants "players pay
 * more than the NPC" can write `avgVend: 500` as shorthand for `vend: 'higher'`.
 */
export function withVend(item) {
  return item.vend === undefined ? { ...item, vend: vendFlag(item) } : item;
}
