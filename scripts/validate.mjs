/**
 * Checks src/data/loot.json for mistakes before you commit.
 *
 * Usage: npm run validate
 *
 * ERRORS   = must be fixed (the site may break). Exits with code 1.
 * WARNINGS = worth a look, but won't block anything.
 */
import { readFileSync } from 'node:fs';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const DATA_FILE = 'src/data/loot.json';
const SCHEMA_FILE = 'src/data/schema.json';

const errors = [];
const warnings = [];

let items;
try {
  items = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
} catch (err) {
  // Most common cause: a missing or extra comma, or an unclosed quote.
  console.error(`ERROR: ${DATA_FILE} is not valid JSON.\n  ${err.message}`);
  process.exit(1);
}
const schema = JSON.parse(readFileSync(SCHEMA_FILE, 'utf8'));

/** "/12/actions/0" -> "Acorn (actions/0)" so people can find the item. */
const describe = (path) => {
  const [, index, ...rest] = path.split('/');
  const name = items[index]?.name ?? `item #${index}`;
  return rest.length ? `${name} (${rest.join('/')})` : name;
};

// 1. Structure: does every item follow the schema?
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
if (!ajv.validate(schema, items)) {
  for (const e of ajv.errors) {
    const allowed = e.params.allowedValues ? `: ${e.params.allowedValues.join(', ')}` : '';
    errors.push(`${describe(e.instancePath)} ${e.message}${allowed}`);
  }
}

// 2. Duplicates.
const findDuplicates = (key) => {
  const seen = new Map();
  for (const item of items) {
    const value = item[key];
    if (value == null) continue;
    seen.set(value, [...(seen.get(value) ?? []), item.name]);
  }
  return [...seen].filter(([, names]) => names.length > 1);
};
for (const [id, names] of findDuplicates('id')) {
  errors.push(`Duplicate id "${id}": ${names.join(', ')}`);
}
for (const [itemId, names] of findDuplicates('itemId')) {
  warnings.push(`Same itemId ${itemId} used by: ${names.join(', ')}`);
}

// 3. Gentle reminders.
const noAction = items.filter((item) => item.actions?.length === 0).map((item) => item.name);
if (noAction.length) warnings.push(`${noAction.length} items have no action yet: ${noAction.join(', ')}`);

const isSorted = items.every((item, i) => i === 0 || items[i - 1].name.localeCompare(item.name) <= 0);
if (!isSorted) warnings.push('Items are not in A-Z order by name. Keeping them sorted makes changes easier to review.');

// Report.
warnings.forEach((w) => console.warn(`WARNING: ${w}`));
errors.forEach((e) => console.error(`ERROR: ${e}`));
console.log(`\nChecked ${items.length} items: ${errors.length} errors, ${warnings.length} warnings.`);
process.exit(errors.length ? 1 : 0);
