import { parseEventTime } from './time.ts';
import type { Session } from './types.ts';

// Shape of https://sessionize.com/api/v2/{id}/view/All (fields we use).
type SzItem = { id: number | string; name: string };
type SzCategory = { id: number | string; title: string; items: SzItem[] };
type SzSession = {
  id: number | string;
  title: string;
  description?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isServiceSession?: boolean;
  speakers?: (string | { id: string; name?: string })[];
  categoryItems?: (number | string)[];
  categories?: { id: number | string; name: string; categoryItems: SzItem[] }[];
  roomId?: number | string | null;
  room?: string | null;
};
type SzAll = {
  sessions?: SzSession[];
  speakers?: { id: string; fullName?: string; firstName?: string; lastName?: string }[];
  categories?: SzCategory[];
  rooms?: { id: number | string; name: string }[];
};

const SUB_CONFERENCE = /droid|flutter|swift|react|agentic|\bxr\b|xr ?devs|game|kotlin|ios|android|leadership/i;

/**
 * Picks the Sessionize category that represents the sub-conference. Scores each
 * category by how many of its items look like a next.app sub-conference, falls
 * back to a category titled "Track".
 */
export function pickTrackCategory(categories: SzCategory[]): SzCategory | null {
  let best: SzCategory | null = null;
  let bestScore = 0;
  for (const c of categories) {
    const score = c.items.filter((i) => SUB_CONFERENCE.test(i.name)).length;
    if (score > bestScore) {
      best = c;
      bestScore = score;
    }
  }
  return best ?? categories.find((c) => /track|conference/i.test(c.title)) ?? null;
}

export function parseSessionizeAll(json: unknown): Session[] {
  const data = json as SzAll;
  if (!data || !Array.isArray(data.sessions)) {
    throw new Error('Not a Sessionize "All" response (no sessions array)');
  }
  const speakers = new Map(
    (data.speakers ?? []).map((s) => [
      s.id,
      s.fullName ?? [s.firstName, s.lastName].filter(Boolean).join(' '),
    ]),
  );
  const rooms = new Map((data.rooms ?? []).map((r) => [String(r.id), r.name]));
  const trackCategory = pickTrackCategory(data.categories ?? []);
  const trackItems = new Map((trackCategory?.items ?? []).map((i) => [String(i.id), i.name]));

  const sessions: Session[] = [];
  for (const s of data.sessions) {
    if (!s.startsAt || !s.endsAt) continue;
    const startsAt = parseEventTime(s.startsAt);
    const endsAt = parseEventTime(s.endsAt);
    if (Number.isNaN(startsAt) || Number.isNaN(endsAt)) continue;

    let track: string | null = null;
    for (const itemId of s.categoryItems ?? []) {
      track = trackItems.get(String(itemId)) ?? null;
      if (track) break;
    }

    sessions.push({
      id: String(s.id),
      title: s.title.trim(),
      description: s.description?.trim() ?? '',
      startsAt,
      endsAt,
      room: s.room ?? (s.roomId != null ? rooms.get(String(s.roomId)) : undefined) ?? '',
      track,
      speakers: (s.speakers ?? [])
        .map((sp) => (typeof sp === 'string' ? speakers.get(sp) : sp.name ?? speakers.get(sp.id)))
        .filter((n): n is string => !!n),
      isService: !!s.isServiceSession,
    });
  }
  return sessions.sort((a, b) => a.startsAt - b.startsAt || a.room.localeCompare(b.room));
}

const ID_IN_URL = /sessionize\.com\/api\/v2\/([a-z0-9]{4,16})\b/gi;

/** Accepts a bare ID or any sessionize.com/api/v2/{id}/... URL. */
export function normalizeSessionizeId(input: string): string | null {
  const trimmed = input.trim();
  const fromUrl = [...trimmed.matchAll(ID_IN_URL)][0];
  if (fromUrl) return fromUrl[1].toLowerCase();
  return /^[a-z0-9]{4,16}$/i.test(trimmed) ? trimmed.toLowerCase() : null;
}

/** Returns the Sessionize API IDs embedded in a page, most frequent first. */
export function extractSessionizeIds(html: string): string[] {
  const counts = new Map<string, number>();
  for (const m of html.matchAll(ID_IN_URL)) {
    const id = m[1].toLowerCase();
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

/** Same-site links on a page that look like agenda pages. */
export function findAgendaLinks(html: string, baseUrl: string): string[] {
  const links = new Set<string>();
  for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    if (!/agenda|schedule|program|sessions|timetable/i.test(m[1])) continue;
    try {
      const url = new URL(m[1], baseUrl);
      if (url.hostname.endsWith('nextappcon.com')) links.add(url.toString());
    } catch {
      // ignore malformed hrefs
    }
  }
  return [...links];
}

export const sessionizeAllUrl = (id: string) => `https://sessionize.com/api/v2/${id}/view/All`;
