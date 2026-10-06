import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../../components/Badge.tsx';
import { colors } from '../../components/theme.ts';
import { TrackChip } from '../../components/TrackChip.tsx';
import { otherOptions } from '../../lib/plan.ts';
import { findClashes } from '../../lib/schedule.ts';
import { dayKey, formatDayLabel, formatTime } from '../../lib/time.ts';
import { useAgenda } from '../../state/AgendaContext.tsx';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessionsById, speakersById, favIds, favs, toggleFav, switchTo, planEntry } = useAgenda();
  const session = sessionsById.get(id);
  if (!session) {
    return <Text style={styles.missing}>This talk is no longer in the agenda.</Text>;
  }
  const fav = favIds.has(session.id);
  const clashes = fav ? findClashes(session, favs) : [];
  const entry = planEntry(session.id);
  const options = entry
    ? otherOptions(entry, session.id).flatMap((o) => {
        const s = sessionsById.get(o.id);
        return s ? [{ session: s, rationale: o.rationale }] : [];
      })
    : [];
  const glass = isLiquidGlassAvailable();
  const speakers = session.speakers.map((name, i) => {
    const id = session.speakerIds[i];
    return { name, id, profile: id ? speakersById.get(id) : undefined };
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.badges}>
        <TrackChip track={session.track} />
        {entry?.slot.kind === 'keynote' && entry.role === 'pick' && <Badge label="YOUR KEYNOTE" color={colors.accent} />}
        {entry?.slot.topPick && entry.role === 'pick' && <Badge label="TOP PICK" color={colors.star} />}
        {entry?.role === 'alternative' && <Badge label="ALTERNATIVE" color={colors.muted} />}
      </View>
      <Text style={styles.title}>{session.title}</Text>
      {speakers.length > 0 && (
        <Text style={styles.speakers}>
          {speakers.map((sp, i) => (
            <Text key={sp.id ?? sp.name}>
              {i > 0 && ', '}
              {sp.profile ? (
                <Text style={styles.speakerLink} onPress={() => router.push(`/speaker/${sp.id}`)}>
                  {sp.name}
                </Text>
              ) : (
                sp.name
              )}
            </Text>
          ))}
        </Text>
      )}

      <View style={styles.whereRow}>
        <SymbolView name="calendar" size={18} tintColor={colors.muted} />
        <Text style={styles.when}>
          {formatDayLabel(dayKey(session.startsAt))} · {formatTime(session.startsAt)}–{formatTime(session.endsAt)}
        </Text>
      </View>
      {!!session.room && (
        <View style={styles.whereRow}>
          <SymbolView name="mappin.and.ellipse" size={18} tintColor={colors.accent} />
          <Text style={[styles.when, styles.room]}>{session.room}</Text>
        </View>
      )}

      {!session.isService && (
        <Pressable
          onPress={() => toggleFav(session)}
          style={({ pressed }) => [styles.button, fav && styles.buttonFav, pressed && { opacity: 0.8 }]}
        >
          <SymbolView name={fav ? 'star.fill' : 'star'} size={18} tintColor={fav ? colors.star : '#FFFFFF'} />
          <Text style={[styles.buttonText, fav && { color: colors.text }]}>
            {fav ? 'In my plan' : 'Add to my plan'}
          </Text>
        </Pressable>
      )}

      {clashes.length > 0 && (
        <View style={styles.clashBox}>
          <Text style={styles.clashTitle}>Clashes with</Text>
          {clashes.map((c) => (
            <Text key={c.id} style={styles.clashItem}>
              {formatTime(c.startsAt)}–{formatTime(c.endsAt)} {c.title}
            </Text>
          ))}
        </View>
      )}

      {entry && (
        <GlassView style={[styles.why, !glass && styles.whyFallback]} glassEffectStyle="regular">
          <Text style={styles.whyLabel}>Why it’s in your plan</Text>
          <Text style={styles.whyText}>{entry.rationale}</Text>
          {entry.notes.map((n) => (
            <Text key={n} style={styles.note}>
              {n}
            </Text>
          ))}
        </GlassView>
      )}

      {!!session.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abstract</Text>
          <Text style={styles.description}>{session.description}</Text>
        </View>
      )}

      {speakers.some((sp) => sp.profile) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{speakers.length > 1 ? 'Speakers' : 'Speaker'}</Text>
          {speakers.map(({ id, profile }) =>
            profile ? (
              <Pressable
                key={id}
                onPress={() => router.push(`/speaker/${id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${profile.name} bio`}
                style={({ pressed }) => [styles.option, pressed && { opacity: 0.7 }]}
              >
                {profile.photoUrl ? (
                  <Image source={{ uri: profile.photoUrl }} style={styles.avatar} accessibilityIgnoresInvertColors />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <SymbolView name="person.fill" size={20} tintColor={colors.muted} />
                  </View>
                )}
                <View style={styles.optionBody}>
                  <Text style={styles.optionTitle}>{profile.name}</Text>
                  {!!profile.tagLine && (
                    <Text style={styles.optionMeta} numberOfLines={2}>
                      {profile.tagLine}
                    </Text>
                  )}
                </View>
                <Text style={styles.bioLink}>Bio</Text>
                <SymbolView name="chevron.right" size={14} tintColor={colors.muted} />
              </Pressable>
            ) : null,
          )}
        </View>
      )}

      {options.length > 0 && (
        <View style={styles.options}>
          <Text style={styles.sectionTitle}>Other options in this slot</Text>
          {options.map(({ session: o, rationale }) => {
            const chosen = favIds.has(o.id);
            return (
              <View key={o.id} style={styles.option}>
                <Pressable style={styles.optionBody} onPress={() => router.replace(`/session/${o.id}`)}>
                  <Text style={styles.optionTitle}>{o.title}</Text>
                  <Text style={styles.optionMeta}>
                    {formatTime(o.startsAt)}–{formatTime(o.endsAt)} · {o.room}
                  </Text>
                  <Text style={styles.optionWhy}>{rationale}</Text>
                </Pressable>
                {chosen ? (
                  <SymbolView name="star.fill" size={20} tintColor={colors.star} />
                ) : (
                  <Pressable onPress={() => switchTo(o)} style={styles.switch} hitSlop={8}>
                    <Text style={styles.switchText}>Switch</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 28, gap: 12, paddingBottom: 48 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  speakers: { fontSize: 16, fontWeight: '600', color: colors.muted },
  speakerLink: { color: colors.accent },
  whereRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  when: { fontSize: 16, color: colors.text },
  room: { fontWeight: '700', color: colors.accent },
  button: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    padding: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  buttonFav: { backgroundColor: colors.fill },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  clashBox: { backgroundColor: colors.dangerBg, padding: 12, borderRadius: 12, gap: 4 },
  clashTitle: { color: colors.danger, fontWeight: '700' },
  clashItem: { color: colors.danger },
  why: { padding: 16, borderRadius: 20, borderCurve: 'continuous', gap: 6, overflow: 'hidden' },
  whyFallback: { backgroundColor: colors.card },
  whyLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.4, textTransform: 'uppercase' },
  whyText: { fontSize: 15, lineHeight: 21, color: colors.text },
  note: { fontSize: 14, lineHeight: 20, color: colors.danger },
  options: { gap: 8 },
  section: { gap: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.fill },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  bioLink: { color: colors.accent, fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.muted, textTransform: 'uppercase', marginTop: 4 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  optionBody: { flex: 1, gap: 3 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  optionMeta: { fontSize: 12, color: colors.muted },
  optionWhy: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  switch: { backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  switchText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  description: { fontSize: 15, lineHeight: 22, color: colors.text },
  missing: { padding: 32, textAlign: 'center', color: colors.muted },
});
