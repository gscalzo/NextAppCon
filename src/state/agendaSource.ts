import { parseSessionizeAll, parseSessionizeSpeakers, sessionizeAllUrl } from '../lib/sessionize.ts';
import type { Session, Speaker } from '../lib/types.ts';

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

/** Downloads and merges the agenda (talks and their speakers) of every given Sessionize event. */
export async function fetchAgenda(ids: string[]): Promise<{ sessions: Session[]; speakers: Speaker[] }> {
  const byId = new Map<string, Session>();
  const speakersById = new Map<string, Speaker>();
  const errors: string[] = [];
  for (const id of ids) {
    try {
      const json = await (await get(sessionizeAllUrl(id))).json();
      for (const s of parseSessionizeAll(json)) {
        if (new Date(s.startsAt).getUTCFullYear() === EVENT_YEAR) byId.set(s.id, s);
      }
      for (const sp of parseSessionizeSpeakers(json)) speakersById.set(sp.id, sp);
    } catch (e) {
      errors.push(`${id}: ${(e as Error).message}`);
    }
  }
  if (byId.size === 0) {
    throw new Error(errors.length ? errors.join('\n') : 'No 2026 sessions found');
  }
  const sessions = [...byId.values()].sort((a, b) => a.startsAt - b.startsAt || a.room.localeCompare(b.room));
  // Keep only speakers of this edition's talks.
  const used = new Set(sessions.flatMap((s) => s.speakerIds));
  return { sessions, speakers: [...speakersById.values()].filter((sp) => used.has(sp.id)) };
}
