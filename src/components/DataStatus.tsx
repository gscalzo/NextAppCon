import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAgenda } from '../state/AgendaContext.tsx';
import { colors, font, gutter } from './theme.ts';

export function ago(ms: number): string {
  const mins = Math.round((Date.now() - ms) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 48 * 60) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} d ago`;
}

/** One-line data freshness indicator: loading, or offline with a saved copy. */
export function DataStatus() {
  const { status, fetchedAt } = useAgenda();
  if (status.kind === 'loading') {
    return (
      <View style={styles.row}>
        <ActivityIndicator size="small" color={colors.muted} />
        <Text style={styles.text}>Updating agenda…</Text>
      </View>
    );
  }
  if (status.kind === 'error' && fetchedAt) {
    return (
      <View style={styles.row}>
        <View style={styles.dot} />
        <Text style={styles.text}>Offline · agenda saved {ago(fetchedAt)}</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: gutter, paddingVertical: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.faint },
  text: { ...font.meta, color: colors.muted },
});
