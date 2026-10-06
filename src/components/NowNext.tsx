import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dayKey, formatCountdown, formatDayLabel, formatTime } from '../lib/time.ts';
import type { Session } from '../lib/types.ts';
import { colors } from './theme.ts';
import { useNowNext } from './useNow.ts';

function whenLabel(session: Session, running: boolean, now: number): string {
  if (running) return `NOW · until ${formatTime(session.endsAt)}`;
  if (dayKey(session.startsAt) !== dayKey(now)) {
    return `NEXT · ${formatDayLabel(dayKey(session.startsAt))} ${formatTime(session.startsAt)}`;
  }
  return `NEXT · ${formatCountdown(now, session.startsAt)} (${formatTime(session.startsAt)})`;
}

/** Berlin clock plus the favourite running now or coming next, and where it is. */
export function NowNextContent({ compact = false }: { compact?: boolean }) {
  const { now, upcoming } = useNowNext();
  const open = () => upcoming && router.push(`/session/${upcoming.session.id}`);

  return (
    <Pressable style={[styles.row, compact && styles.rowCompact]} onPress={open} disabled={!upcoming}>
      <View style={styles.clock}>
        <SymbolView name="clock" size={compact ? 14 : 16} tintColor={colors.now} />
        <Text style={[styles.clockText, compact && styles.small]}>{formatTime(now)}</Text>
      </View>
      {upcoming ? (
        <View style={styles.text}>
          {!compact && <Text style={styles.kicker}>{whenLabel(upcoming.session, upcoming.running, now)}</Text>}
          <Text style={[styles.title, compact && styles.small]} numberOfLines={1}>
            {compact ? `${formatTime(upcoming.session.startsAt)} ` : ''}
            {upcoming.session.title}
          </Text>
          {!!upcoming.session.room && (
            <Text style={styles.room} numberOfLines={1}>
              {upcoming.running ? 'In ' : 'Go to '}
              {upcoming.session.room}
            </Text>
          )}
        </View>
      ) : (
        <Text style={[styles.text, styles.room]}>No more favourites today</Text>
      )}
    </Pressable>
  );
}

/** Liquid Glass card for the top of My plan; a plain card where glass is unavailable. */
export function NowNextCard() {
  const glass = isLiquidGlassAvailable();
  return (
    <GlassView style={[styles.card, !glass && styles.cardFallback]} glassEffectStyle="regular" isInteractive>
      <NowNextContent />
    </GlassView>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 8, borderRadius: 22, borderCurve: 'continuous', overflow: 'hidden' },
  cardFallback: { backgroundColor: colors.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowCompact: { paddingVertical: 6, paddingHorizontal: 14, gap: 10 },
  clock: { alignItems: 'center', gap: 2, minWidth: 44 },
  clockText: { fontSize: 17, fontWeight: '700', color: colors.now, fontVariant: ['tabular-nums'] },
  small: { fontSize: 13 },
  text: { flex: 1, gap: 1 },
  kicker: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.4 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  room: { fontSize: 13, fontWeight: '600', color: colors.accent },
});
