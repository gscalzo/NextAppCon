import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { dayKey, formatCountdown, formatDayLabel, formatTime } from '../lib/time.ts';
import type { Session } from '../lib/types.ts';
import { noOrphan } from '../lib/text.ts';
import { Cover } from './Cover.tsx';
import { FadeIn, usePressScale, usePulse } from './motion.tsx';
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

/** Pastel hero at the top of My plan: what is on now or next, who is speaking, and where to walk. */
export function NowNextCard() {
  const { now, upcoming } = useNowNext();
  const press = usePressScale(0.98);
  const pulse = usePulse(!!upcoming?.running);
  if (!upcoming) {
    return (
      <FadeIn style={[styles.hero, styles.heroIdle]}>
        <Text style={styles.kicker}>Berlin · {formatTime(now)}</Text>
        <Text style={styles.heroTitle}>No more favourites today</Text>
      </FadeIn>
    );
  }
  const { session, running } = upcoming;
  return (
    <FadeIn>
      <Pressable {...press.handlers} onPress={() => router.push(`/session/${session.id}`)}>
        <Animated.View style={[styles.hero, press.style]}>
          <View style={styles.kickerRow}>
            <Animated.View style={[styles.pulse, !running && styles.pulseNext, pulse]} />
            <Text style={styles.kicker}>{whenLabel(session, running, now)}</Text>
            <Text style={styles.heroClock}>{formatTime(now)}</Text>
          </View>
          <View style={styles.heroMain}>
            <Cover session={session} size={76} />
            <View style={styles.flex}>
              <Text style={styles.heroTitle} numberOfLines={3} lineBreakStrategyIOS="standard" textBreakStrategy="balanced">
                {noOrphan(session.title)}
              </Text>
              {session.speakers.length > 0 && (
                <Text style={styles.heroSpeakers} numberOfLines={1}>
                  {session.speakers.join(', ')}
                </Text>
              )}
            </View>
          </View>
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
        </Animated.View>
      </Pressable>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 3 },
  accessory: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 16 },
  accessoryInline: { paddingVertical: 6, paddingHorizontal: 14 },
  accessoryTitle: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2, color: colors.text },
  accessoryMeta: { ...font.meta, color: colors.muted },
  small: { fontSize: 13 },
  clock: { ...font.meta, ...font.time, fontWeight: '600', color: colors.muted },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.now },
  pulseNext: { backgroundColor: colors.star },

  // Luma's warm onboarding gradient, softened to a pastel so the page stays light.
  hero: {
    marginHorizontal: gutter,
    marginTop: 8,
    marginBottom: 4,
    padding: 18,
    gap: 14,
    borderRadius: radius.card + 6,
    borderCurve: 'continuous',
    experimental_backgroundImage: 'linear-gradient(135deg, #FFE9DB 0%, #FBE4F1 50%, #E6ECFF 100%)',
  },
  heroIdle: { gap: 4 },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kicker: { ...font.meta, flex: 1, color: colors.text, fontWeight: '600' },
  heroClock: { ...font.meta, ...font.time, color: colors.muted },
  heroMain: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroTitle: { ...font.display, fontSize: 20, lineHeight: 25, color: colors.text },
  heroSpeakers: { ...font.meta, fontSize: 14, color: colors.muted },
  roomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: radius.control,
    borderCurve: 'continuous',
    backgroundColor: '#FFFFFFCC',
  },
  roomText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  roomTime: { ...font.meta, ...font.time, color: colors.muted },
});
