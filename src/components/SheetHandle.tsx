import { StyleSheet, View } from 'react-native';

import { colors, isAndroid } from './theme.ts';

/**
 * M3 bottom sheet drag handle. iOS draws its own grabber (sheetGrabberVisible),
 * Android draws nothing, so sheets render this after their content.
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
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', paddingTop: 14 },
  handle: { width: 32, height: 4, borderRadius: 2, backgroundColor: colors.faint },
});
