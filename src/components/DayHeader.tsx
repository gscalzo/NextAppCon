import { StyleSheet, Text, View } from 'react-native';

import { dayKey, formatDayLabel } from '../lib/time.ts';
import { colors, gutter } from './theme.ts';

const DAY = 86_400_000;

/** Luma-style day heading: "Today / Wed 7 Oct", or "7 Oct / Wed" further out. */
export function DayHeader({ day, now }: { day: string; now: number }) {
  const relative = day === dayKey(now) ? 'Today' : day === dayKey(now + DAY) ? 'Tomorrow' : null;
  const label = formatDayLabel(day);
  const [weekday, ...rest] = label.split(' ');
  return (
    <View style={styles.row}>
      <Text style={styles.main}>{relative ?? rest.join(' ')}</Text>
      <Text style={styles.sub}>/ {relative ? label : weekday}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: gutter,
    paddingTop: 24,
    paddingBottom: 8,
  },
  main: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4, color: colors.text },
  sub: { fontSize: 20, fontWeight: '500', letterSpacing: -0.4, color: colors.faint },
});
