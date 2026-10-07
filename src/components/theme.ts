import { Platform, type TextStyle } from 'react-native';

/** Android gets Material 3 Expressive; iOS keeps the Luma look. */
export const isAndroid = Platform.OS === 'android';

// iOS: Luma-style palette (checked against Luma's iOS screens on Mobbin): a plain white
// canvas, near-black ink, grey secondary text, soft tinted status pills, and one
// signal colour kept for what is happening now. The app is light-only
// (userInterfaceStyle "light" in app.json), so native bars match these values.
const luma = {
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
  heroGradient: 'linear-gradient(135deg, #FFE9DB 0%, #FBE4F1 50%, #E6ECFF 100%)',
  // Selected segment of a button group, and the touch ripple (Android only).
  selected: '#131517',
  onSelected: '#FFFFFF',
  ripple: '#13151714',
};

// Android: a Material 3 tonal scheme (SchemeVibrant, light) generated with
// material-color-utilities from the brand orange #E8501A, so roles map 1:1:
// surface → bg, surfaceContainer → card, primary → ink, and so on.
const material: typeof luma = {
  bg: '#FFF8F6', // surface
  card: '#FFE9E3', // surfaceContainer
  text: '#271813', // onSurface
  muted: '#58423B', // onSurfaceVariant
  faint: '#8C7169', // outline
  border: '#DFC0B7', // outlineVariant
  fill: '#FFE2DA', // surfaceContainerHigh
  ink: '#AE3200', // primary
  onInk: '#FFFFFF', // onPrimary
  accent: '#AE3200', // primary
  accentSoft: '#FFDBD0', // primaryContainer
  star: '#C17A00',
  starSoft: '#FFDDB8', // tertiaryContainer
  success: '#1B7A43',
  successSoft: '#C9F0D3',
  danger: '#BA1A1A', // error
  dangerBg: '#FFDAD6', // errorContainer
  now: '#C43C00',
  hero: '#852400', // onPrimaryContainer
  heroGradient: 'linear-gradient(135deg, #FFDBD0 0%, #FFDCC6 55%, #FFDDB8 100%)',
  selected: '#FFDCC6', // secondaryContainer
  onSelected: '#633E23', // onSecondaryContainer
  ripple: '#AE32001F',
};

export const colors = isAndroid ? material : luma;

/** Soft background for a pill whose text uses one of the colours above. */
export function softOf(color: string): string {
  if (color === colors.accent || color === colors.now) return colors.accentSoft;
  if (color === colors.star) return colors.starSoft;
  if (color === colors.success) return colors.successSoft;
  if (color === colors.danger) return colors.dangerBg;
  return colors.fill;
}

// M3 Expressive leans on bigger, rounder shapes: 16 for tiles, 28 (extra large)
// for cards and sheets, and fully round buttons.
export const radius = isAndroid
  ? ({ tile: 16, card: 28, control: 20, button: 999, pill: 999 } as const)
  : ({ tile: 14, card: 18, control: 14, button: 14, pill: 999 } as const);

/** Horizontal page gutter shared by headers, rows and controls. */
export const gutter = 16;

// One type scale for the whole app: size carries hierarchy, tight tracking on
// titles, tabular figures for every time. Roboto reads best untracked, so the
// Android scale drops the negative letter spacing and leans on weight (M3
// Expressive's emphasized styles) instead.
export const font = isAndroid
  ? ({
      display: { fontSize: 28, fontWeight: '700', letterSpacing: 0, lineHeight: 34 },
      title: { fontSize: 17, fontWeight: '600', letterSpacing: 0, lineHeight: 22 },
      body: { fontSize: 15, lineHeight: 21, letterSpacing: 0.1 },
      meta: { fontSize: 13, fontWeight: '500', letterSpacing: 0.1 },
      caption: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
      time: { fontVariant: ['tabular-nums'] },
    } satisfies Record<string, TextStyle>)
  : ({
      display: { fontSize: 26, fontWeight: '700', letterSpacing: -0.6 },
      title: { fontSize: 17, fontWeight: '600', letterSpacing: -0.3, lineHeight: 22 },
      body: { fontSize: 15, lineHeight: 21 },
      meta: { fontSize: 13, fontWeight: '500' },
      caption: { fontSize: 12, fontWeight: '600' },
      time: { fontVariant: ['tabular-nums'] },
    } satisfies Record<string, TextStyle>);

/** Touch ripple for Android pressables; iOS ignores `android_ripple`. */
export const ripple = { color: colors.ripple } as const;
