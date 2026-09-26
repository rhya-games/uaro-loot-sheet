import { useMemo, useState } from 'react';
import { useAdmin } from './useAdmin.js';
import ZenyInput from './ZenyInput.jsx';
import CopyItemId from '../components/CopyItemId.jsx';
import { Page } from '../components/Page.jsx';
import { valueTargets } from '../utils/targets.js';
import targetIds from '../data/target-ids.json' with { type: 'json' };

/**
 * Admin mode's list of "Used For" targets that need a value: hats, pet
 * evolutions and other finished things that aren't loot in the sheet, so
 * they have no price of their own. What they're worth decides whether
 * their parts are worth keeping (see src/utils/suggest.js). Values save to
 * src/data/use-targets.json, and the parts' actions update right away.
 *
 * Targets that decide the most suggestions come first. Quests and skills
 * aren't listed (see suggest.js), and neither are targets in the sheet
 * (price those on the loot page). 0 means "checked, no shops sell it",
 * and shows as "None". Item IDs (click to copy, for
 * @whobuy and shop searches) come from src/data/target-ids.json
 * (`npm run sync:targets`); a pet evolution's is the evolved pet's egg.
 *
 * Only exists under `npm run dev`.
 */
export default function TargetsPage() {
  const { items, suggest, targets, saveTarget } = useAdmin();
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const byTarget = new Map([...valueTargets(items)].map(([name, target]) => [name, { ...target, decides: 0 }]));
    // "Decides": parts whose only reason to keep, for now, is this target
    // having no value. Giving it one settles whether to keep them.
    for (const item of items) {
      const open = suggest(item).uses.filter((use) => use.worthIt && use.source === 'not loot');
      if (open.length === 1 && byTarget.has(open[0].for)) byTarget.get(open[0].for).decides++;
    }
    return [...byTarget.values()].sort(
      (a, b) => b.decides - a.decides || b.parts.length - a.parts.length || a.name.localeCompare(b.name),
    );
  }, [items, suggest]);

  const words = query.trim().toLowerCase();
  const shown = words ? rows.filter((row) => row.name.toLowerCase().includes(words)) : rows;
  const needsValue = shown.filter((row) => !targets.has(row.name));
  const checked = shown.filter((row) => targets.has(row.name)).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Page
      title="Target values"
      intro="What hats, pet evolutions and other finished things sell for. Parts are worth keeping when the finished thing is worth more than they sell for, or when no shops sell it. Type 0 for no shops."
    >
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find a target"
        aria-label="Find a target"
        className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted"
      />
      <TargetTable title={`Needs a price (${needsValue.length})`} rows={needsValue} targets={targets} onSave={saveTarget} />
      <TargetTable title={`Checked (${checked.length})`} rows={checked} targets={targets} onSave={saveTarget} />
    </Page>
  );
}

/**
 * One list of targets with a value box each.
 *
 * Props:
 *   title   - heading, with the count
 *   rows    - [{ name, parts, decides }]
 *   targets - Map of target name -> value
 *   onSave  - (name, value) => Promise
 */
function TargetTable({ title, rows, targets, onSave }) {
  if (!rows.length) return null;
  return (
    <section className="panel overflow-hidden">
      <h2 className="border-b border-line px-4 py-3 font-semibold text-fg">{title}</h2>
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted [--focus-gap:transparent]">
          <tr>
            <th className="px-4 py-2 font-medium">Target</th>
            <th className="px-4 py-2 text-right font-medium">Decides</th>
            <th className="px-4 py-2 text-right font-medium">Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-line align-top">
              <td className="px-4 py-2">
                <p className="font-medium text-fg">{row.name}</p>
                <p className="text-xs text-muted">
                  {targetIds.ids[row.name] ? <CopyItemId itemId={targetIds.ids[row.name]} /> : 'No item ID'}
                  {' · '}
                  {row.parts.length > 4 ? `${row.parts.slice(0, 4).join(', ')} and ${row.parts.length - 4} more` : row.parts.join(', ')}
                </p>
              </td>
              <td className="px-4 py-2 text-right tabular-nums">{row.decides || '—'}</td>
              <td className="px-4 py-2">
                <ZenyInput
                  value={targets.get(row.name) ?? null}
                  onSave={(value) => onSave(row.name, value)}
                  label={`Price of ${row.name}`}
                  noneHint="no shops"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
