import { dayKey } from './time.ts';
import type { Session } from './types.ts';

/** True when the two sessions share any time. Back-to-back does not count. */
export function overlaps(a: Session, b: Session): boolean {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}

/** Faved sessions that clash with `candidate`. */
export function findClashes(candidate: Session, favs: Session[]): Session[] {
  return favs.filter((f) => f.id !== candidate.id && overlaps(candidate, f));
}

/** IDs of faved sessions that overlap another faved session. */
export function clashingIds(favs: Session[]): Set<string> {
  const ids = new Set<string>();
  const sorted = [...favs].sort((a, b) => a.startsAt - b.startsAt);
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length && sorted[j].startsAt < sorted[i].endsAt; j++) {
      ids.add(sorted[i].id);
      ids.add(sorted[j].id);
    }
  }
  return ids;
}

/** The fav that is running now, or the next one to start. */
export function currentOrNextFav(
  favs: Session[],
  now: number,
): { session: Session; running: boolean } | null {
  const upcoming = favs.filter((f) => f.endsAt > now).sort((a, b) => a.startsAt - b.startsAt);
  const running = upcoming.find((f) => f.startsAt <= now);
  const next = upcoming.find((f) => f.startsAt > now);
  // Prefer announcing the next talk once the current one is nearly over.
  if (running && (!next || next.startsAt - now > 10 * 60_000)) return { session: running, running: true };
  return next ? { session: next, running: false } : running ? { session: running, running: true } : null;
}

export function groupByDay(sessions: Session[]): Map<string, Session[]> {
  const days = new Map<string, Session[]>();
  for (const s of sessions) {
    const key = dayKey(s.startsAt);
    days.set(key, [...(days.get(key) ?? []), s]);
  }
  return days;
}

/** Groups sessions (already sorted by start) into time slots for section lists. */
export function groupByStart(sessions: Session[]): { startsAt: number; data: Session[] }[] {
  const slots: { startsAt: number; data: Session[] }[] = [];
  for (const s of sessions) {
    const last = slots[slots.length - 1];
    if (last && last.startsAt === s.startsAt) last.data.push(s);
    else slots.push({ startsAt: s.startsAt, data: [s] });
  }
  return slots;
}

/**
 * Where the current-time line goes in a day's list (sorted by start): before the
 * first item that starts after `now`, or at the end while the last one runs.
 * -1 when `now` falls outside the day.
 */
export function nowLineIndex(items: { startsAt: number; endsAt: number }[], now: number): number {
  if (items.length === 0 || now < items[0].startsAt) return -1;
  if (now >= Math.max(...items.map((s) => s.endsAt))) return -1;
  const i = items.findIndex((s) => s.startsAt > now);
  return i === -1 ? items.length : i;
}
