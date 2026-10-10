import { describe, expect, it } from 'vitest';
import schema from '../data/schema.json' with { type: 'json' };
import { CATEGORY_DESCRIPTIONS } from './labels.js';

describe('CATEGORY_DESCRIPTIONS', () => {
  it('describes every category in the schema, and nothing else', () => {
    expect(Object.keys(CATEGORY_DESCRIPTIONS).sort()).toEqual([...schema.$defs.category.enum].sort());
  });
});
