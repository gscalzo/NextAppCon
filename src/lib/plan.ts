export type PlanAlternative = { id: string; rationale: string; notes: string[] };

export type PlanSlot = {
  id: string;
  kind: 'talk' | 'keynote';
  topPick: boolean;
  rationale: string;
  notes: string[];
  alternatives: PlanAlternative[];
};

export type PlanEntry = {
  /** The slot's original pick. */
  slot: PlanSlot;
  /** Whether this session is the original pick or one of its alternatives. */
  role: 'pick' | 'alternative';
  rationale: string;
  notes: string[];
};

/** Looks up every session mentioned in the plan, picks and alternatives alike. */
export function indexPlan(plan: PlanSlot[]): Map<string, PlanEntry> {
  const index = new Map<string, PlanEntry>();
  for (const slot of plan) {
    index.set(slot.id, { slot, role: 'pick', rationale: slot.rationale, notes: slot.notes });
    for (const alt of slot.alternatives) {
      index.set(alt.id, { slot, role: 'alternative', rationale: alt.rationale, notes: alt.notes });
    }
  }
  return index;
}

/** The slot's pick plus its alternatives, without `sessionId` itself. */
export function otherOptions(entry: PlanEntry, sessionId: string): { id: string; rationale: string }[] {
  const options = [
    { id: entry.slot.id, rationale: entry.slot.rationale },
    ...entry.slot.alternatives.map((a) => ({ id: a.id, rationale: a.rationale })),
  ];
  return options.filter((o) => o.id !== sessionId);
}

/** Favourites after the one-time import of the plan's picks. */
export function seedFavourites(existing: Iterable<string>, plan: PlanSlot[]): Set<string> {
  return new Set([...existing, ...plan.map((s) => s.id)]);
}
