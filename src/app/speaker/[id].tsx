import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatars } from '../../components/Avatars.tsx';
import { Cover } from '../../components/Cover.tsx';
import { Star } from '../../components/Star.tsx';
import { colors, font, gutter, radius, ripple } from '../../components/theme.ts';
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
        <Avatars names={[speaker.name]} photos={[speaker.photoUrl]} size={96} />
        <Text style={styles.name}>{speaker.name}</Text>
        {!!speaker.tagLine && <Text style={styles.tagLine}>{speaker.tagLine}</Text>}
        {speaker.links.length > 0 && (
          <View style={styles.links}>
            {speaker.links.map((l) => (
              <Pressable
                key={l.url}
                onPress={() => Linking.openURL(l.url)}
                accessibilityRole="link"
                style={({ pressed }) => [styles.link, pressed && styles.pressed]}
              >
                <SymbolView
                  name={{ ios: 'arrow.up.right', android: 'arrow_outward' }}
                  size={12}
                  tintColor={colors.text}
                />
                <Text style={styles.linkText}>{l.title}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        {speaker.bio ? (
          <Text style={styles.bio}>{speaker.bio}</Text>
        ) : (
          <Text style={styles.empty}>This speaker hasn’t added a bio.</Text>
        )}
      </View>

      {talks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{talks.length > 1 ? 'Talks' : 'Talk'}</Text>
          {talks.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => router.push(`/session/${t.id}`)}
              android_ripple={ripple}
              style={({ pressed }) => [styles.talk, pressed && styles.pressed]}
            >
              <Cover session={t} size={44} />
              <View style={styles.talkBody}>
                <Text style={styles.talkTitle}>{t.title}</Text>
                <Text style={styles.talkMeta}>
                  {formatDayLabel(dayKey(t.startsAt))} · {formatTime(t.startsAt)} – {formatTime(t.endsAt)}
                  {t.room ? ` · ${t.room}` : ''}
                </Text>
              </View>
              {favIds.has(t.id) && <Star filled size={17} color={colors.star} />}
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right' }}
                size={13}
                tintColor={colors.faint}
              />
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: gutter, paddingTop: 32, paddingBottom: 48, gap: 16 },
  header: { alignItems: 'center', gap: 6, paddingBottom: 4 },
  name: { ...font.display, color: colors.text, textAlign: 'center', marginTop: 8 },
  tagLine: { ...font.body, color: colors.muted, textAlign: 'center' },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 8 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.fill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  linkText: { ...font.meta, fontWeight: '600', color: colors.text },
  pressed: { opacity: 0.7 },
  section: {
    gap: 10,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectionTitle: { ...font.title, color: colors.text },
  bio: { ...font.body, color: colors.text },
  empty: { ...font.body, color: colors.muted },
  talk: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  talkBody: { flex: 1, gap: 2 },
  talkTitle: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2, color: colors.text },
  talkMeta: { ...font.meta, ...font.time, fontWeight: '400', color: colors.muted },
  missing: { padding: 32, textAlign: 'center', color: colors.muted },
});
