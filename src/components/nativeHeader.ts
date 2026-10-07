import { Platform } from 'react-native';

import { colors } from './theme.ts';

/**
 * Large-title native header; transparent on iOS so the system glass/blur shows through.
 * Android has no large title, so it gets an M3 top app bar instead: the surface
 * colour and an emphasized headline-sized title.
 */
export const nativeHeader = {
  headerLargeTitleEnabled: true,
  headerTransparent: Platform.OS === 'ios',
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerTintColor: colors.text,
  contentStyle: { backgroundColor: colors.bg },
  ...(Platform.OS === 'android' && {
    headerStyle: { backgroundColor: colors.bg },
    headerTitleStyle: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  }),
} as const;
