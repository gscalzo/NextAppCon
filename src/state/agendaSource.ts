import { parseSessionizeAll, sessionizeAllUrl } from '../lib/sessionize.ts';
import type { Session } from '../lib/types.ts';

// Sessionize event behind https://www.nextappcon.com's agenda.
export const DEFAULT_SESSIONIZE_ID = 'yak5yl8m';
// next.app devCon Berlin 2026 runs 7–9 Oct; ignore sessions from other editions.
const EVENT_YEAR = 2026;

async function get(url: string, timeoutMs = 15_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${res.status} for ${url}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/** Downloads and merges the agenda of every given Sessionize event. */
export async function fetchSessions(ids: string[]): Promise<Session[]> {
  const byId = new Map<string, Session>();
  const errors: string[] = [];
  for (const id of ids) {
    try {
      const sessions = parseSessionizeAll(await (await get(sessionizeAllUrl(id))).json());
      for (const s of sessions) {
        if (new Date(s.startsAt).getUTCFullYear() === EVENT_YEAR) byId.set(s.id, s);
      }
    } catch (e) {
      errors.push(`${id}: ${(e as Error).message}`);
    }
  }
  if (byId.size === 0) {
    throw new Error(errors.length ? errors.join('\n') : 'No 2026 sessions found');
  }
  return [...byId.values()].sort((a, b) => a.startsAt - b.startsAt || a.room.localeCompare(b.room));
}
