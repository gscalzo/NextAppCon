/** Personal per-talk notes, keyed by session id. */
export type TalkNotes = Record<string, string>;

/** Returns `notes` with `text` stored for `id`; blank text removes the entry. Unchanged input returns `notes` itself. */
export function withNote(notes: TalkNotes, id: string, text: string): TalkNotes {
  const value = text.trim() ? text : undefined;
  if (notes[id] === value) return notes;
  const next = { ...notes };
  if (value === undefined) delete next[id];
  else next[id] = value;
  return next;
}

/** Returns a copy of `ids` with `id` added or removed. */
export function toggled(ids: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(ids);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
