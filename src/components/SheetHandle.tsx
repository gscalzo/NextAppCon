import { StyleSheet, View } from 'react-native';

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

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 14, paddingBottom: 10, backgroundColor: colors.bg },
  handle: { width: 32, height: 4, borderRadius: 2, backgroundColor: colors.faint },
});
