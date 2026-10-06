import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dayKey, formatCountdown, formatDayLabel, formatTime } from '../lib/time.ts';
import type { Session } from '../lib/types.ts';
import { colors, font, gutter, radius } from './theme.ts';
import { useNowNext } from './useNow.ts';

function whenLabel(session: Session, running: boolean, now: number): string {
  if (running) return `Happening now · until ${formatTime(session.endsAt)}`;
  if (dayKey(session.startsAt) !== dayKey(now)) {
    return `Up next · ${formatDayLabel(dayKey(session.startsAt))}, ${formatTime(session.startsAt)}`;
  }
  return `Up next · ${formatCountdown(now, session.startsAt)}`;
}

/** Berlin clock plus the favourite running now or coming next; compact form for the tab bar accessory. */
export function NowNextContent({ compact = false }: { compact?: boolean }) {
  const { now, upcoming } = useNowNext();
  const open = () => upcoming && router.push(`/session/${upcoming.session.id}`);

  return (
    <Pressable style={[styles.accessory, compact && styles.accessoryInline]} onPress={open} disabled={!upcoming}>
      {upcoming && <View style={[styles.pulse, !upcoming.running && styles.pulseNext]} />}
      <View style={styles.flex}>
        <Text style={[styles.accessoryTitle, compact && styles.small]} numberOfLines={1}>
          {upcoming ? upcoming.session.title : 'No more favourites today'}
        </Text>
        {!compact && !!upcoming?.session.room && (
          <Text style={styles.accessoryMeta} numberOfLines={1}>
            {formatTime(upcoming.session.startsAt)} · {upcoming.running ? 'In ' : 'Go to '}
            {upcoming.session.room}
          </Text>
        )}
      </View>
      <Text style={[styles.clock, compact && styles.small]}>{formatTime(now)}</Text>
    </Pressable>
  );
}

/** Ink hero at the top of My plan, in the spirit of Luma's live activity: what, when, and where to walk. */
export function NowNextCard() {
  const { now, upcoming } = useNowNext();
  if (!upcoming) {
    return (
      <View style={[styles.hero, styles.heroIdle]}>
        <Text style={styles.kicker}>Berlin · {formatTime(now)}</Text>
        <Text style={styles.heroTitle}>No more favourites today</Text>
      </View>
    );
  }
  const { session, running } = upcoming;
  return (
    <Pressable
      style={({ pressed }) => [styles.hero, pressed && { opacity: 0.92 }]}
      onPress={() => router.push(`/session/${session.id}`)}
    >
      <View style={styles.kickerRow}>
        <View style={[styles.pulse, !running && styles.pulseNext]} />
        <Text style={styles.kicker}>{whenLabel(session, running, now)}</Text>
        <Text style={styles.heroClock}>{formatTime(now)}</Text>
      </View>
      <Text style={styles.heroTitle} numberOfLines={3}>
        {session.title}
      </Text>
      {session.speakers.length > 0 && (
        <Text style={styles.heroSpeakers} numberOfLines={1}>
          {session.speakers.join(', ')}
        </Text>
      )}
      {!!session.room && (
        <View style={styles.roomPill}>
          <SymbolView name="location.fill" size={13} tintColor={colors.accent} />
          <Text style={styles.roomText} numberOfLines={1}>
            {running ? 'In ' : 'Go to '}
            {session.room}
          </Text>
          <Text style={styles.roomTime}>
            {formatTime(session.startsAt)} – {formatTime(session.endsAt)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 1 },
  accessory: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 16 },
  accessoryInline: { paddingVertical: 6, paddingHorizontal: 14 },
  accessoryTitle: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2, color: colors.text },
  accessoryMeta: { ...font.meta, color: colors.muted },
  small: { fontSize: 13 },
  clock: { ...font.meta, ...font.time, fontWeight: '600', color: colors.muted },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.now },
  pulseNext: { backgroundColor: colors.star },

  hero: {
    marginHorizontal: gutter - 4,
    marginTop: 8,
    marginBottom: 4,
    padding: 20,
    gap: 8,
    borderRadius: radius.card + 4,
    borderCurve: 'continuous',
    backgroundColor: colors.hero,
  },
  heroIdle: { gap: 4 },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kicker: { ...font.meta, flex: 1, color: '#B9BBBE' },
  heroClock: { ...font.meta, ...font.time, color: '#8A8C90' },
  heroTitle: { ...font.display, fontSize: 22, lineHeight: 27, color: '#FFFFFF' },
  heroSpeakers: { ...font.meta, fontSize: 14, color: '#B9BBBE' },
  roomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.control,
    borderCurve: 'continuous',
    backgroundColor: '#FFFFFF14',
  },
  roomText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  roomTime: { ...font.meta, ...font.time, color: '#B9BBBE' },
});
