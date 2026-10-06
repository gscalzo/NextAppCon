import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { trackColor } from '../lib/tracks.ts';
import { formatTime } from '../lib/time.ts';
import type { Session } from '../lib/types.ts';
import { useAgenda } from '../state/AgendaContext.tsx';
import { colors } from './theme.ts';
import { TrackChip } from './TrackChip.tsx';

type Props = { session: Session; clash?: boolean; past?: boolean };

export function SessionRow({ session, clash = false, past = false }: Props) {
  const { favIds, toggleFav } = useAgenda();
  const fav = favIds.has(session.id);

  return (
    <Pressable
      onPress={() => router.push(`/session/${session.id}`)}
      style={({ pressed }) => [
        styles.row,
        { borderLeftColor: trackColor(session.track) },
        clash && styles.clash,
        past && styles.past,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.body}>
        <Text style={styles.time}>
          {formatTime(session.startsAt)}–{formatTime(session.endsAt)}
          {session.room ? `  ·  ${session.room}` : ''}
        </Text>
        <Text style={[styles.title, session.isService && styles.service]}>{session.title}</Text>
        {session.speakers.length > 0 && (
          <Text style={styles.speakers} numberOfLines={1}>
            {session.speakers.join(', ')}
          </Text>
        )}
        <View style={styles.meta}>
          <TrackChip track={session.track} />
          {clash && <Text style={styles.clashLabel}>⚠︎ Clash</Text>}
        </View>
      </View>
      {!session.isService && (
        <Pressable
          onPress={() => toggleFav(session)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={fav ? 'Remove from favourites' : 'Add to favourites'}
          style={styles.star}
        >
          <Text style={[styles.starIcon, { color: fav ? colors.star : colors.border }]}>★</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 5,
  },
  clash: { backgroundColor: colors.dangerBg },
  past: { opacity: 0.45 },
  body: { flex: 1, gap: 4 },
  time: { fontSize: 12, color: colors.muted, fontVariant: ['tabular-nums'] },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  service: { fontWeight: '400', fontStyle: 'italic', color: colors.muted },
  speakers: { fontSize: 13, color: colors.muted },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  clashLabel: { fontSize: 12, fontWeight: '700', color: colors.danger },
  star: { paddingLeft: 10, justifyContent: 'center' },
  starIcon: { fontSize: 28 },
});
