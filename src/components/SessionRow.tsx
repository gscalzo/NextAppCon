import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { trackColor } from '../lib/tracks.ts';
import { formatTime } from '../lib/time.ts';
import type { Session } from '../lib/types.ts';
import { useAgenda } from '../state/AgendaContext.tsx';
import { Avatars } from './Avatars.tsx';
import { Badge } from './Badge.tsx';
import { colors, font, gutter, radius } from './theme.ts';

type Props = { session: Session; now: number; clash?: boolean; compact?: boolean };

export function SessionRow({ session, now, clash = false, compact = false }: Props) {
  const { favIds, toggleFav, switchTo, planEntry } = useAgenda();
  const fav = favIds.has(session.id);
  const entry = planEntry(session.id);
  const live = session.startsAt <= now && now < session.endsAt;
  const past = session.endsAt <= now;
  const keynote = entry?.role === 'pick' && entry.slot.kind === 'keynote';
  const topPick = entry?.role === 'pick' && entry.slot.topPick;
  const alternative = entry?.role === 'alternative' && !fav;

  const minutes = Math.round((session.endsAt - session.startsAt) / 60_000);
  const status = live
    ? { label: 'Live', color: colors.now }
    : clash
      ? { label: 'Clash', color: colors.danger }
      : keynote
        ? { label: 'Keynote', color: colors.accent }
        : topPick
          ? { label: 'Top pick', color: colors.star }
          : null;

  return (
    <Link href={`/session/${session.id}`} asChild>
      <Link.Trigger>
        <Pressable
          style={({ pressed }) => [
            styles.row,
            compact && styles.compact,
            past && styles.past,
            pressed && styles.pressed,
          ]}
        >
          <View
            style={[
              styles.tile,
              compact && styles.tileCompact,
              { backgroundColor: session.isService ? colors.fill : trackColor(session.track) + '24' },
            ]}
          >
            <Text style={[styles.tileTime, compact && styles.tileTimeCompact]}>{formatTime(session.startsAt)}</Text>
            {!compact && <Text style={styles.tileMinutes}>{minutes} min</Text>}
            {!compact && status && (
              <View style={styles.tileBadge}>
                <Badge label={status.label} color={status.color} />
              </View>
            )}
          </View>

          <View style={styles.body}>
            {session.speakers.length > 0 && !compact && (
              <View style={styles.speakerRow}>
                <Avatars names={session.speakers} size={18} />
                <Text style={styles.speakers} numberOfLines={1}>
                  {session.speakers.join(', ')}
                </Text>
              </View>
            )}
            <Text
              style={[styles.title, compact && styles.compactTitle, session.isService && styles.serviceTitle]}
              numberOfLines={compact ? 2 : 3}
            >
              {session.title}
            </Text>
            {compact ? (
              <Text style={styles.meta} numberOfLines={1}>
                Alternative{session.room ? ` · ${session.room}` : ''}
              </Text>
            ) : (
              <>
                <View style={styles.metaRow}>
                  <SymbolView name="clock" size={13} tintColor={live ? colors.now : colors.faint} />
                  <Text style={[styles.meta, live && styles.live]}>
                    {formatTime(session.startsAt)} – {formatTime(session.endsAt)}
                  </Text>
                  {!!session.track && (
                    <>
                      <View style={[styles.trackDot, { backgroundColor: trackColor(session.track) }]} />
                      <Text style={[styles.meta, styles.shrink]} numberOfLines={1}>
                        {session.track}
                      </Text>
                    </>
                  )}
                </View>
                {!!session.room && (
                  <View style={styles.metaRow}>
                    <SymbolView name="mappin.and.ellipse" size={13} tintColor={colors.faint} />
                    <Text style={[styles.meta, styles.shrink]} numberOfLines={1}>
                      {session.room}
                    </Text>
                  </View>
                )}
                {alternative && <Text style={styles.altNote}>Alternative in your plan</Text>}
              </>
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
                tintColor={fav ? colors.star : colors.faint}
                size={compact ? 17 : 20}
                fallback={<Text style={{ fontSize: 18, color: fav ? '#D98A00' : '#A7A9AC' }}>★</Text>}
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

const TILE = 68;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingHorizontal: gutter, paddingVertical: 12 },
  // Alternatives sit indented under the pick, smaller and quieter.
  compact: { paddingLeft: gutter + TILE - 40, paddingVertical: 8 },
  past: { opacity: 0.45 },
  pressed: { opacity: 0.6 },
  // Luma puts a square cover on the left; talks have none, so the tile carries the start time on a track tint.
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  tileCompact: { width: 40, height: 40, borderRadius: 10 },
  tileTime: { fontSize: 17, fontWeight: '700', letterSpacing: -0.4, color: colors.text, ...font.time },
  tileTimeCompact: { fontSize: 12, letterSpacing: -0.2 },
  tileMinutes: { fontSize: 11, fontWeight: '500', color: colors.muted },
  tileBadge: { position: 'absolute', bottom: -9, alignSelf: 'center' },
  body: { flex: 1, gap: 4 },
  speakerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  speakers: { ...font.meta, flex: 1, color: colors.muted },
  title: { ...font.title, color: colors.text },
  compactTitle: { fontSize: 15, lineHeight: 20, fontWeight: '500', letterSpacing: -0.2 },
  serviceTitle: { fontWeight: '500', color: colors.muted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { ...font.meta, ...font.time, color: colors.muted },
  live: { color: colors.now, fontWeight: '600' },
  shrink: { flexShrink: 1 },
  trackDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 6 },
  altNote: { ...font.caption, color: colors.faint, marginTop: 2 },
  star: { paddingTop: 2, paddingLeft: 4 },
});
