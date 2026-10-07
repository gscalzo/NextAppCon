import { StyleSheet, Text, View } from 'react-native';

import { formatTime } from '../lib/time.ts';
import { colors, font, gutter, radius } from './theme.ts';

/** "Now" marker between talks: a signal-colour pill on a hairline. */
export function NowLine({ now }: { now: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`Current time ${formatTime(now)}`}>
      <View style={styles.pill}>
        <Text style={styles.text}>Now {formatTime(now)}</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: gutter, paddingVertical: 8, gap: 8 },
  pill: { backgroundColor: colors.now, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  text: { ...font.caption, ...font.time, color: '#FFFFFF' },
  line: { flex: 1, height: 1.5, borderRadius: 1, backgroundColor: colors.now },
});
