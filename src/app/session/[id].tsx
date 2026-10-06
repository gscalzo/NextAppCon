import { Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../components/theme.ts';
import { TrackChip } from '../../components/TrackChip.tsx';
import { findClashes } from '../../lib/schedule.ts';
import { dayKey, formatDayLabel, formatTime } from '../../lib/time.ts';
import { useAgenda } from '../../state/AgendaContext.tsx';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessionsById, favIds, favs, toggleFav } = useAgenda();
  const session = sessionsById.get(id);
  if (!session) {
    return <Text style={styles.missing}>This talk is no longer in the agenda.</Text>;
  }
  const fav = favIds.has(session.id);
  const clashes = fav ? findClashes(session, favs) : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: session.track ?? 'Talk' }} />
      <TrackChip track={session.track} />
      <Text style={styles.title}>{session.title}</Text>
      <Text style={styles.when}>
        {formatDayLabel(dayKey(session.startsAt))} · {formatTime(session.startsAt)}–{formatTime(session.endsAt)}
      </Text>
      {!!session.room && <Text style={styles.when}>{session.room}</Text>}
      {session.speakers.length > 0 && <Text style={styles.speakers}>{session.speakers.join(', ')}</Text>}
      {!session.isService && (
        <Pressable onPress={() => toggleFav(session)} style={[styles.button, fav && styles.buttonFav]}>
          <Text style={[styles.buttonText, fav && { color: colors.text }]}>
            {fav ? '★ In my schedule (tap to remove)' : '☆ Add to my schedule'}
          </Text>
        </Pressable>
      )}
      {clashes.length > 0 && (
        <View style={styles.clashBox}>
          <Text style={styles.clashTitle}>⚠︎ Clashes with</Text>
          {clashes.map((c) => (
            <Text key={c.id} style={styles.clashItem}>
              {formatTime(c.startsAt)}–{formatTime(c.endsAt)} {c.title}
            </Text>
          ))}
        </View>
      )}
      {!!session.description && <Text style={styles.description}>{session.description}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 10 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  when: { fontSize: 15, color: colors.muted },
  speakers: { fontSize: 16, fontWeight: '600', color: colors.text },
  button: { backgroundColor: colors.accent, padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 6 },
  buttonFav: { backgroundColor: '#FEF3C7' },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  clashBox: { backgroundColor: colors.dangerBg, padding: 12, borderRadius: 8, gap: 4 },
  clashTitle: { color: colors.danger, fontWeight: '700' },
  clashItem: { color: colors.danger },
  description: { fontSize: 15, lineHeight: 22, color: colors.text },
  missing: { padding: 32, textAlign: 'center', color: colors.muted },
});
