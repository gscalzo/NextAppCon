import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { trackColor } from '../lib/tracks.ts';
import { formatTime } from '../lib/time.ts';
import type { Session } from '../lib/types.ts';
import { useAgenda } from '../state/AgendaContext.tsx';
import { Badge } from './Badge.tsx';
import { colors } from './theme.ts';
import { TrackChip } from './TrackChip.tsx';

type Props = { session: Session; now: number; clash?: boolean; compact?: boolean };

export function SessionRow({ session, now, clash = false, compact = false }: Props) {
  const { favIds, toggleFav, switchTo, planEntry } = useAgenda();
  const fav = favIds.has(session.id);
  const entry = planEntry(session.id);
  const live = session.startsAt <= now && now < session.endsAt;
  const past = session.endsAt <= now;

  return (
    <Link href={`/session/${session.id}`} asChild>
      <Link.Trigger>
        <Pressable
          style={({ pressed }) => [
            styles.row,
            compact && styles.compact,
            { borderLeftColor: trackColor(session.track) },
            clash && styles.clash,
            past && styles.past,
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={styles.body}>
            <View style={styles.meta}>
              <Text style={styles.time}>
                {formatTime(session.startsAt)}–{formatTime(session.endsAt)}
                {session.room ? `  ·  ${session.room}` : ''}
              </Text>
              {live && <Badge label="LIVE" color={colors.now} />}
            </View>
            <Text
              style={[styles.title, compact && styles.compactTitle, session.isService && styles.service]}
              numberOfLines={compact ? 2 : undefined}
            >
              {session.title}
            </Text>
            {session.speakers.length > 0 && (
              <Text style={styles.speakers} numberOfLines={1}>
                {session.speakers.join(', ')}
              </Text>
            )}
            {!compact && (
              <View style={styles.meta}>
                <TrackChip track={session.track} />
                {entry?.slot.kind === 'keynote' && entry.role === 'pick' && (
                  <Badge label="YOUR KEYNOTE" color={colors.accent} />
                )}
                {entry?.slot.topPick && entry.role === 'pick' && <Badge label="TOP PICK" color={colors.star} />}
                {entry?.role === 'alternative' && !fav && <Badge label="ALTERNATIVE" color={colors.muted} />}
                {clash && <Badge label="CLASH" color={colors.danger} />}
              </View>
            )}
          </View>
          {!session.isService && (
            <Pressable
              onPress={() => toggleFav(session)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={fav ? 'Remove from favourites' : 'Add to favourites'}
              style={styles.star}
            >
              <SymbolView
                name={fav ? 'star.fill' : 'star'}
                tintColor={fav ? colors.star : colors.muted}
                size={compact ? 20 : 24}
                fallback={<Text style={{ fontSize: 22, color: fav ? '#F59E0B' : '#94A3B8' }}>★</Text>}
              />
            </Pressable>
          )}
        </Pressable>
      </Link.Trigger>
      <Link.Preview />
      {!session.isService && (
        <Link.Menu>
          <Link.MenuAction icon={fav ? 'star.slash' : 'star'} onPress={() => toggleFav(session)}>
            {fav ? 'Remove from favourites' : 'Add to favourites'}
          </Link.MenuAction>
          {!fav && (
            <Link.MenuAction icon="arrow.left.arrow.right" onPress={() => switchTo(session)}>
              Switch to this talk
            </Link.MenuAction>
          )}
        </Link.Menu>
      )}
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderLeftWidth: 5,
  },
  compact: { marginLeft: 32, paddingVertical: 8, backgroundColor: colors.fill },
  clash: { backgroundColor: colors.dangerBg },
  past: { opacity: 0.45 },
  body: { flex: 1, gap: 4 },
  time: { fontSize: 12, color: colors.muted, fontVariant: ['tabular-nums'] },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  compactTitle: { fontSize: 14, fontWeight: '500' },
  service: { fontWeight: '400', fontStyle: 'italic', color: colors.muted },
  speakers: { fontSize: 13, color: colors.muted },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  star: { paddingLeft: 10, justifyContent: 'center' },
});
