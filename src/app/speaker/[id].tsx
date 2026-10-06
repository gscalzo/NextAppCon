import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../components/theme.ts';
import { dayKey, formatDayLabel, formatTime } from '../../lib/time.ts';
import { useAgenda } from '../../state/AgendaContext.tsx';

export default function SpeakerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { speakersById, sessions, favIds } = useAgenda();
  const speaker = speakersById.get(id);
  if (!speaker) {
    return <Text style={styles.missing}>No bio for this speaker yet. Tap Update now in Settings to fetch it.</Text>;
  }
  const talks = sessions.filter((s) => s.speakerIds.includes(speaker.id));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {speaker.photoUrl ? (
          <Image source={{ uri: speaker.photoUrl }} style={styles.photo} accessibilityIgnoresInvertColors />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <SymbolView name="person.fill" size={40} tintColor={colors.muted} />
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>{speaker.name}</Text>
          {!!speaker.tagLine && <Text style={styles.tagLine}>{speaker.tagLine}</Text>}
        </View>
      </View>

      {speaker.bio ? (
        <Text style={styles.bio}>{speaker.bio}</Text>
      ) : (
        <Text style={styles.empty}>This speaker hasn’t added a bio.</Text>
      )}

      {speaker.links.length > 0 && (
        <View style={styles.links}>
          {speaker.links.map((l) => (
            <Pressable
              key={l.url}
              onPress={() => Linking.openURL(l.url)}
              accessibilityRole="link"
              style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
            >
              <SymbolView name="link" size={14} tintColor={colors.accent} />
              <Text style={styles.linkText}>{l.title}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {talks.length > 0 && (
        <View style={styles.talks}>
          <Text style={styles.sectionTitle}>{talks.length > 1 ? 'Talks' : 'Talk'}</Text>
          {talks.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => router.push(`/session/${t.id}`)}
              style={({ pressed }) => [styles.talk, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.talkBody}>
                <Text style={styles.talkTitle}>{t.title}</Text>
                <Text style={styles.talkMeta}>
                  {formatDayLabel(dayKey(t.startsAt))} · {formatTime(t.startsAt)}–{formatTime(t.endsAt)}
                  {t.room ? ` · ${t.room}` : ''}
                </Text>
              </View>
              {favIds.has(t.id) && <SymbolView name="star.fill" size={18} tintColor={colors.star} />}
              <SymbolView name="chevron.right" size={14} tintColor={colors.muted} />
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 28, gap: 14, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  photo: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.fill },
  photoFallback: { alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 4 },
  name: { fontSize: 24, fontWeight: '700', color: colors.text },
  tagLine: { fontSize: 15, color: colors.muted },
  bio: { fontSize: 15, lineHeight: 22, color: colors.text },
  empty: { fontSize: 15, color: colors.muted, fontStyle: 'italic' },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  linkText: { color: colors.accent, fontWeight: '600', fontSize: 14 },
  talks: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.muted, textTransform: 'uppercase', marginTop: 4 },
  talk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  talkBody: { flex: 1, gap: 3 },
  talkTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  talkMeta: { fontSize: 12, color: colors.muted },
  missing: { padding: 32, textAlign: 'center', color: colors.muted },
});
