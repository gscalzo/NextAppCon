import { DynamicColorIOS, Platform, type ColorValue, type TextStyle } from 'react-native';

// Luma-style palette (checked against Luma's iOS screens on Mobbin): a plain white
// canvas, near-black ink, grey secondary text, soft tinted status pills, and one
// signal colour kept for what is happening now. iOS follows light/dark mode;
// other platforms use the light values.
const dyn = (light: string, dark: string): ColorValue =>
  Platform.OS === 'ios' ? DynamicColorIOS({ light, dark }) : light;

export const colors = {
  bg: dyn('#FFFFFF', '#111214'),
  // Grouped surfaces (settings groups, sheets' inner boxes) sit one step off the canvas.
  card: dyn('#F5F5F3', '#1C1D20'),
  text: dyn('#131517', '#F3F3F1'),
  muted: dyn('#737578', '#9C9EA2'),
  faint: dyn('#A7A9AC', '#5F6267'),
  border: dyn('#0000000F', '#FFFFFF14'),
  fill: dyn('#EFEFEC', '#27282C'),
  // Primary buttons and selected states are ink, not a brand tint.
  ink: dyn('#131517', '#F3F3F1'),
  onInk: dyn('#FFFFFF', '#131517'),
  // The signal colour: live talks, the now line, the room to go to.
  accent: dyn('#E8501A', '#FF7340'),
  accentSoft: dyn('#E8501A1A', '#FF734029'),
  star: dyn('#D98A00', '#FFB938'),
  starSoft: dyn('#F0A0201F', '#FFB93829'),
  success: dyn('#1F9D55', '#4ADE80'),
  successSoft: dyn('#1F9D551A', '#4ADE8026'),
  danger: dyn('#D93B3B', '#FF6B6B'),
  dangerBg: dyn('#D93B3B17', '#FF6B6B24'),
  now: dyn('#E8501A', '#FF7340'),
  // The now/next hero stays dark in both modes, lifted off the canvas in dark mode.
  hero: dyn('#131517', '#222327'),
};

/** Soft background for a pill whose text uses one of the colours above. */
export function softOf(color: ColorValue): ColorValue {
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
