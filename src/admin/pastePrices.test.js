import { describe, expect, it } from 'vitest';
import { actionsAfter, parsePriceLines, planPrices } from './pastePrices.js';
import { CHECK_NOTES } from './verify.js';

const TODAY = '2026-09-26';

/** A made-up item; itemId 1 isn't in any uaRO override list. */
const item = (fields) => ({
  id: 'test-item',
  name: 'Test Item',
  itemId: 1,
  itemType: 'Misc',
  categories: [],
  uses: [],
  actions: [],
  npcBuyable: 'no',
  sellValue: 100, // NPC pays 124 with Overcharge
  avgVend: null,
  lastVerified: null,
  verificationNotes: '',
  ...fields,
});

describe('parsePriceLines', () => {
  it('reads the item ID and the vend price, split by spaces', () => {
    expect(parsePriceLines('7119 780')).toEqual([{ number: 1, raw: '7119 780', itemId: 7119, prices: { avgVend: 780 } }]);
  });

  it('takes the same shorthand as the price boxes, and 0 or none for "nobody is selling"', () => {
    expect(parsePriceLines('1550  1.2m')[0].prices).toEqual({ avgVend: 1_200_000 });
    expect(parsePriceLines('1550 none')[0].prices).toEqual({ avgVend: 0 });
    expect(parsePriceLines('1550 12,500')[0].prices).toEqual({ avgVend: 12500 });
  });

  it('reads a spreadsheet paste split by tabs or semicolons', () => {
    expect(parsePriceLines('1\t300')[0].prices).toEqual({ avgVend: 300 });
    expect(parsePriceLines('1;300')[0].prices).toEqual({ avgVend: 300 });
  });

  it('accepts #ID, blank lines and Windows line endings, and numbers lines from the text', () => {
    const lines = parsePriceLines('#10 5\r\n\r\n11 6');
    expect(lines.map((line) => [line.number, line.itemId])).toEqual([[1, 10], [3, 11]]);
  });

  it('reports lines it cannot read', () => {
    expect(parsePriceLines('Bacillus 780')[0].error).toMatch(/isn't an item ID/);
    expect(parsePriceLines('7119 lots')[0].error).toMatch(/Can't read "lots"/);
    expect(parsePriceLines('7119')[0].error).toMatch(/No price/);
    expect(parsePriceLines('7119 -')[0].error).toMatch(/No price/);
    expect(parsePriceLines('7119 1 2')[0].error).toMatch(/Too many columns/);
  });
});

describe('planPrices', () => {
  const plan = (text, items) => planPrices(parsePriceLines(text), items, TODAY);

  it('plans the prices with the verification changes', () => {
    const [row] = plan('1 500', [item({})]);
    expect(row.status).toBe('ok');
    expect(row.changes).toEqual({
      avgVend: 500,
      lastVerified: TODAY,
      verificationNotes: CHECK_NOTES.avgVend,
    });
  });

  it('skips an ID that is not in the sheet', () => {
    expect(plan('99 500', [item({})])[0]).toMatchObject({ status: 'skip', reason: 'No item has ID 99' });
  });

  it('skips items NPCs sell', () => {
    expect(plan('1 500', [item({ npcBuyable: 'yes' })])[0]).toMatchObject({ status: 'skip', reason: expect.stringMatching(/NPCs sell it/) });
  });

  it('uses the first line when an ID is listed twice', () => {
    const rows = plan('1 500\n1 900', [item({})]);
    expect(rows.map((row) => row.status)).toEqual(['ok', 'skip']);
    expect(rows[0].prices.avgVend).toBe(500);
  });

  it('does not guess when two items share an ID', () => {
    const items = [item({ id: 'a', name: 'A' }), item({ id: 'b', name: 'B' })];
    expect(plan('1 500', items)[0]).toMatchObject({ status: 'skip', reason: expect.stringMatching(/2 items share ID 1: A, B/) });
  });

  it('passes unreadable lines on as errors', () => {
    expect(plan('nope', [item({})])[0]).toMatchObject({ status: 'error' });
  });
});

describe('actionsAfter', () => {
  const targets = new Map();

  it('gives the actions the new prices suggest, and null where they stay', () => {
    const changing = item({ id: 'a', itemId: 1, actions: ['Vend'] }); // vend 100 is under the NPC price: NPC
    const staying = item({ id: 'b', itemId: 2, actions: ['Vend'] }); // vend 5000: still Vend
    const items = [changing, staying];
    const rows = planPrices(parsePriceLines('1 100\n2 5000'), items, TODAY);
    const result = actionsAfter(rows, items, targets);
    expect(result.get('a')).toEqual(['NPC']);
    expect(result.get('b')).toBeNull();
  });
});
