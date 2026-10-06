import { Platform } from 'react-native';

import { colors } from './theme.ts';

/** Large-title native header; transparent on iOS so the system glass/blur shows through. */
export const nativeHeader = {
  headerLargeTitleEnabled: true,
  headerTransparent: Platform.OS === 'ios',
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerTintColor: colors.accent,
  contentStyle: { backgroundColor: colors.bg },
} as const;
