import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, isAndroid } from './theme.ts';

/**
 * M3 bottom sheet drag handle. iOS draws its own grabber (sheetGrabberVisible),
 * Android draws nothing, so sheets render this above their ScrollView, as a
 * fixed strip in the sheet colour that content scrolls under.
 */
export function SheetHandle() {
  if (!isAndroid) return null;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.handle} />
    </View>
  );
}

/**
 * Android draws edge to edge, so a sheet's last rows would end up under the
 * gesture or button navigation bar. Returns the bottom padding a sheet's scroll
 * content needs on top of its own; iOS sheets already stop above the home indicator.
 */
export function useSheetBottomInset() {
  const { bottom } = useSafeAreaInsets();
  return isAndroid ? bottom : 0;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 14, paddingBottom: 10, backgroundColor: colors.bg },
  handle: { width: 32, height: 4, borderRadius: 2, backgroundColor: colors.faint },
});
