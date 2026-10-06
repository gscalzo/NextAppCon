import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { currentOrNextFav } from '../lib/schedule.ts';
import { formatCountdown, formatTime } from '../lib/time.ts';
import { useAgenda } from '../state/AgendaContext.tsx';
import { colors } from './theme.ts';

export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function NextUpBanner() {
  const { favs } = useAgenda();
  const now = useNow();
  const next = currentOrNextFav(favs, now);
  if (!next) return null;
  const { session, running } = next;

  return (
    <Pressable style={styles.banner} onPress={() => router.push(`/session/${session.id}`)}>
      <Text style={styles.kicker}>
        {running ? `NOW · until ${formatTime(session.endsAt)}` : `NEXT · ${formatCountdown(now, session.startsAt)}`}
      </Text>
      <Text style={styles.title} numberOfLines={2}>
        {session.title}
      </Text>
      <Text style={styles.where}>
        {formatTime(session.startsAt)}
        {session.room ? ` · ${session.room}` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.accent, margin: 12, padding: 14, borderRadius: 12, gap: 4 },
  kicker: { color: '#C7D2FE', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  where: { color: '#E0E7FF', fontSize: 14 },
});
