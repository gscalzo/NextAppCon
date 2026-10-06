import { Platform, PlatformColor } from 'react-native';

// iOS semantic colours follow light/dark mode and match native controls.
const system = (iosName: string, fallback: string) => (Platform.OS === 'ios' ? PlatformColor(iosName) : fallback);

export const colors = {
  bg: system('systemGroupedBackground', '#F2F2F7'),
  card: system('secondarySystemGroupedBackground', '#FFFFFF'),
  text: system('label', '#0F172A'),
  muted: system('secondaryLabel', '#64748B'),
  border: system('separator', '#E2E8F0'),
  fill: system('tertiarySystemFill', '#E2E8F0'),
  accent: system('systemIndigo', '#4F46E5'),
  star: system('systemYellow', '#F59E0B'),
  danger: system('systemRed', '#DC2626'),
  now: system('systemRed', '#DC2626'),
  dangerBg: '#DC26261A',
};
