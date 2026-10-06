import type { TextStyle } from 'react-native';

// Luma-style palette (checked against Luma's iOS screens on Mobbin): a plain white
// canvas, near-black ink, grey secondary text, soft tinted status pills, and one
// signal colour kept for what is happening now. The app is light-only
// (userInterfaceStyle "light" in app.json), so native bars match these values.

export const colors = {
  bg: '#FFFFFF',
  // Grouped surfaces (settings groups, sheets' inner boxes) sit one step off the canvas.
  card: '#F5F5F3',
  text: '#131517',
  muted: '#737578',
  faint: '#A7A9AC',
  border: '#0000000F',
  fill: '#EFEFEC',
  // Primary buttons and selected states are ink, not a brand tint.
  ink: '#131517',
  onInk: '#FFFFFF',
  // The signal colour: live talks, the now line, the room to go to.
  accent: '#E8501A',
  accentSoft: '#E8501A1A',
  star: '#D98A00',
  starSoft: '#F0A0201F',
  success: '#1F9D55',
  successSoft: '#1F9D551A',
  danger: '#D93B3B',
  dangerBg: '#D93B3B17',
  now: '#E8501A',
  // The now/next hero is the one dark surface, like Luma's live activity.
  hero: '#131517',
};

/** Soft background for a pill whose text uses one of the colours above. */
export function softOf(color: string): string {
  if (color === colors.accent || color === colors.now) return colors.accentSoft;
  if (color === colors.star) return colors.starSoft;
  if (color === colors.success) return colors.successSoft;
  if (color === colors.danger) return colors.dangerBg;
  return colors.fill;
}

export const radius = { tile: 14, card: 18, control: 14, pill: 999 } as const;

/** Horizontal page gutter shared by headers, rows and controls. */
export const gutter = 16;

// One type scale for the whole app: size carries hierarchy, tight tracking on
// titles, tabular figures for every time.
export const font = {
  display: { fontSize: 26, fontWeight: '700', letterSpacing: -0.6 },
  title: { fontSize: 17, fontWeight: '600', letterSpacing: -0.3, lineHeight: 22 },
  body: { fontSize: 15, lineHeight: 21 },
  meta: { fontSize: 13, fontWeight: '500' },
  caption: { fontSize: 12, fontWeight: '600' },
  time: { fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;
