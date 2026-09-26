import { useCallback, useState } from 'react';

/**
 * Keeps the row the cursor is in on screen, in place, with the boxes it had.
 *
 * Saving a price can take a row out of its queue, or change which prices it
 * needs (a Vend price with no @whobuy price drops Whobuy). Without this, the
 * box you are about to type in would vanish mid-typing. The row goes when the
 * cursor leaves it.
 *
 * Arguments:
 *   items    - every item (to find a row that has left the queue)
 *   rows     - the rows being shown, as [{ item }]
 *   fieldsOf - (item) => the price fields that get a box; keep it stable (a
 *              function outside the component)
 *
 * Returns { shown, fieldsFor, enter, leave }:
 *   shown     - `rows`, plus the row being edited if it isn't in them
 *   fieldsFor - (item) => the boxes to draw for it
 *   enter     - (item, beforeId) => the cursor came into the row above `beforeId`
 *   leave     - (id) => the cursor left that row
 */
export function useEditingRow(items, rows, fieldsOf) {
  // The row the cursor is in: { id, fields (the boxes it had), beforeId (the row below it) }.
  const [editing, setEditing] = useState(null);
  const enter = useCallback(
    (item, beforeId) => setEditing((current) => (current?.id === item.id ? current : { id: item.id, fields: fieldsOf(item), beforeId })),
    [fieldsOf],
  );
  const leave = useCallback((id) => setEditing((current) => (current?.id === id ? null : current)), []);

  let shown = rows;
  const kept = editing && !rows.some(({ item }) => item.id === editing.id) && items.find((item) => item.id === editing.id);
  if (kept) {
    const at = rows.findIndex(({ item }) => item.id === editing.beforeId);
    shown = at === -1 ? [...rows, { item: kept }] : [...rows.slice(0, at), { item: kept }, ...rows.slice(at)];
  }

  const fieldsFor = (item) => (editing?.id === item.id ? editing.fields : fieldsOf(item));
  return { shown, fieldsFor, enter, leave };
}
