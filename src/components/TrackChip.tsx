import { StyleSheet, Text, View } from 'react-native';

import { trackColor } from '../lib/tracks.ts';
import { colors } from './theme.ts';

export function TrackChip({ track, active = true }: { track: string | null; active?: boolean }) {
  if (!track) return null;
  const color = trackColor(track);
  return (
    <View style={[styles.chip, { borderColor: color, backgroundColor: active ? color + '26' : 'transparent' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label} numberOfLines={1}>
        {track}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { fontSize: 12, fontWeight: '600', color: colors.text },
});
