import { describe, expect, it } from 'vitest';
import { formatZeny, parseZeny } from './format.js';

describe('parseZeny (admin price boxes)', () => {
  it.each([
    ['12000', 12000],
    ['12,000', 12000],
    ['12k', 12000],
    ['1.5m', 1500000],
    ['200K', 200000],
    [' 3,500z ', 3500],
    ['0', 0],
    ['none', 0],
    ['', null],
  ])('%j -> %j', (text, zeny) => {
    expect(parseZeny(text)).toBe(zeny);
  });

  it('rejects anything else', () => {
    expect(parseZeny('12x')).toBeUndefined();
    expect(parseZeny('1.2.3')).toBeUndefined();
  });
});

describe('formatZeny', () => {
  it('adds commas and z, and shows a dash for no price', () => {
    expect(formatZeny(15500)).toBe('15,500z');
    expect(formatZeny(null)).toBe('—');
  });
});
