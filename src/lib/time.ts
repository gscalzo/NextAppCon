// Conference times are shown in Berlin time regardless of the phone's time zone.
// Europe/Berlin is UTC+1, or UTC+2 from the last Sunday of March 01:00 UTC
// to the last Sunday of October 01:00 UTC. Computed by hand so we don't
// depend on Intl time zone support in Hermes.

const HOUR = 3_600_000;
const MINUTE = 60_000;

function lastSundayUtc(year: number, month: number): number {
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const day = lastDay.getUTCDate() - lastDay.getUTCDay();
  return Date.UTC(year, month, day, 1);
}

export function berlinOffsetMs(utcMs: number): number {
  const year = new Date(utcMs).getUTCFullYear();
  const dstStart = lastSundayUtc(year, 2);
  const dstEnd = lastSundayUtc(year, 9);
  return utcMs >= dstStart && utcMs < dstEnd ? 2 * HOUR : HOUR;
}

/**
 * Parses a Sessionize timestamp. Sessionize sends event-local time without an
 * offset ("2026-10-07T09:00:00"); strings carrying Z or an offset are honoured.
 */
export function parseEventTime(value: string): number {
  if (/(Z|[+-]\d\d:?\d\d)$/.test(value)) return Date.parse(value);
  const m = value.match(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d))?/);
  if (!m) return NaN;
  const asUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0));
  // Guess with the offset at the naive instant, then correct once around DST edges.
  const guess = asUtc - berlinOffsetMs(asUtc);
  return asUtc - berlinOffsetMs(guess);
}

function berlinParts(utcMs: number): Date {
  return new Date(utcMs + berlinOffsetMs(utcMs));
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "09:05" in Berlin time. */
export function formatTime(utcMs: number): string {
  const d = berlinParts(utcMs);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** "2026-10-07" in Berlin time. */
export function dayKey(utcMs: number): string {
  const d = berlinParts(utcMs);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Wed 7 Oct" for a dayKey. */
export function formatDayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return `${WEEKDAYS[date.getUTCDay()]} ${d} ${MONTHS[m - 1]}`;
}

/** "in 12 min", "in 1 h 05 min", "now". */
export function formatCountdown(fromMs: number, toMs: number): string {
  const mins = Math.ceil((toMs - fromMs) / MINUTE);
  if (mins <= 0) return 'now';
  if (mins < 60) return `in ${mins} min`;
  return `in ${Math.floor(mins / 60)} h ${pad(mins % 60)} min`;
}
