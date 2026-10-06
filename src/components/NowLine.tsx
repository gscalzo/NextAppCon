import { StyleSheet, Text, View } from 'react-native';

import { formatTime } from '../lib/time.ts';
import { colors } from './theme.ts';

/** Red "current time" rule, like the one in Calendar. */
export function NowLine({ now }: { now: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`Current time ${formatTime(now)}`}>
      <Text style={styles.time}>{formatTime(now)}</Text>
      <View style={styles.dot} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 },
  time: { color: colors.now, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'], marginRight: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.now },
  line: { flex: 1, height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.now },
});
