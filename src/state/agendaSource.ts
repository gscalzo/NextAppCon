import {
  extractSessionizeIds,
  findAgendaLinks,
  parseSessionizeAll,
  sessionizeAllUrl,
} from '../lib/sessionize.ts';
import type { Session } from '../lib/types.ts';

const SITE = 'https://www.nextappcon.com';
const CANDIDATE_PAGES = ['/agenda', '/schedule', '/program', '/', '/droidcon', '/fluttercon', '/swiftcon', '/reactcon'];
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

/** Scans the nextappcon.com pages for embedded Sessionize API IDs. */
export async function discoverSessionizeIds(): Promise<string[]> {
  const pages = CANDIDATE_PAGES.map((p) => SITE + p);
  const seen = new Set<string>();
  const ids: string[] = [];
  while (pages.length > 0) {
    const url = pages.shift()!;
    if (seen.has(url)) continue;
    seen.add(url);
    let html: string;
    try {
      html = await (await get(url)).text();
    } catch {
      continue;
    }
    for (const id of extractSessionizeIds(html)) if (!ids.includes(id)) ids.push(id);
    if (ids.length > 0) break;
    pages.push(...findAgendaLinks(html, url));
  }
  return ids;
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
