import { StyleSheet, Text, View } from 'react-native';

import { trackColor } from '../lib/tracks.ts';
import { colors, font, radius } from './theme.ts';

/** Track pill; `active` turns it ink, the way Luma marks a selected filter. */
export function TrackChip({ track, active = false }: { track: string | null; active?: boolean }) {
  if (!track) return null;
  return (
    <View style={[styles.chip, active && styles.active]}>
      <View style={[styles.dot, { backgroundColor: trackColor(track) }]} />
      <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
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
    backgroundColor: colors.fill,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  active: { backgroundColor: colors.ink },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { ...font.caption, fontSize: 13, color: colors.text },
  activeLabel: { color: colors.onInk },
});
