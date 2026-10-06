const KNOWN: [RegExp, string][] = [
  [/droid|android|kotlin/i, '#3DDC84'],
  [/flutter/i, '#027DFD'],
  [/swift|ios/i, '#F05138'],
  [/react/i, '#61DAFB'],
  [/agentic|ai\b/i, '#A855F7'],
  [/\bxr\b|xr ?devs/i, '#F59E0B'],
  [/game/i, '#EF4444'],
  [/leader/i, '#64748B'],
];
const FALLBACK = ['#0EA5E9', '#14B8A6', '#E11D48', '#84CC16', '#D946EF', '#F97316'];

export function trackColor(track: string | null): string {
  if (!track) return '#94A3B8';
  for (const [re, color] of KNOWN) if (re.test(track)) return color;
  let hash = 0;
  for (const ch of track) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return FALLBACK[Math.abs(hash) % FALLBACK.length];
}
