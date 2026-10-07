import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatars } from '../../components/Avatars.tsx';
import { Badge } from '../../components/Badge.tsx';
import { Cover } from '../../components/Cover.tsx';
import { usePop } from '../../components/motion.tsx';
import { MyTalkNotes } from '../../components/MyTalkNotes.tsx';
import { colors, font, gutter, radius } from '../../components/theme.ts';
import { TrackChip } from '../../components/TrackChip.tsx';
import { otherOptions } from '../../lib/plan.ts';
import { findClashes } from '../../lib/schedule.ts';
import { dayKey, formatDayLabel, formatTime } from '../../lib/time.ts';
import { useAgenda } from '../../state/AgendaContext.tsx';

/** Luma's event-page detail row: an icon tile, a bold line and a grey line under it. */
function InfoRow({ icon, title, sub, tint }: { icon: SymbolViewProps['name']; title: string; sub?: ReactNode; tint?: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <SymbolView name={icon} size={18} tintColor={tint ?? colors.text} />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoTitle, tint && { color: tint }]}>{title}</Text>
        {typeof sub === 'string' ? <Text style={styles.infoSub}>{sub}</Text> : sub}
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessionsById, speakersById, favIds, favs, toggleFav, switchTo, planEntry } = useAgenda();
  const star = usePop();
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
  const speakers = session.speakers.map((name, i) => {
    const id = session.speakerIds[i];
    return { name, id, photo: session.speakerPhotos?.[i] ?? null, profile: id ? speakersById.get(id) : undefined };
  });
  const minutes = Math.round((session.endsAt - session.startsAt) / 60_000);
  const keynote = entry?.role === 'pick' && entry.slot.kind === 'keynote';
  const topPick = entry?.role === 'pick' && entry.slot.topPick;
  const openSpeaker = (speakerId: string) => router.push(`/speaker/${speakerId}`);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
    >
      <View style={styles.hero}>
        <Cover session={session} size={88} />
        <View style={styles.badges}>
          <TrackChip track={session.track} />
          {keynote && <Badge label="Your keynote" color={colors.accent} />}
          {topPick && <Badge label="Top pick" color={colors.star} />}
          {entry?.role === 'alternative' && <Badge label="Alternative" color={colors.muted} />}
        </View>
      </View>

      <Text style={styles.title}>{session.title}</Text>

      {speakers.length > 0 && (
        <View style={styles.hostRow}>
          <Avatars names={session.speakers} photos={speakers.map((sp) => sp.photo)} size={22} />
          <Text style={styles.hosts}>
            {speakers.map((sp, i) => (
              <Text key={sp.id ?? sp.name}>
                {i > 0 && ', '}
                {sp.profile ? (
                  <Text style={styles.hostLink} onPress={() => openSpeaker(sp.profile!.id)}>
                    {sp.name}
                  </Text>
                ) : (
                  sp.name
                )}
              </Text>
            ))}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <InfoRow
          icon="calendar"
          title={formatDayLabel(dayKey(session.startsAt))}
          sub={`${formatTime(session.startsAt)} – ${formatTime(session.endsAt)} · ${minutes} min`}
        />
        {!!session.room && <InfoRow icon="mappin.and.ellipse" title={session.room} tint={colors.accent} sub="Room" />}
      </View>

      {!session.isService && (
        <Pressable
          onPress={() => {
            star.pop();
            toggleFav(session);
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, fav && styles.buttonFav, pressed && { opacity: 0.85 }]}
        >
          <Animated.View style={star.style}>
            <SymbolView name={fav ? 'star.fill' : 'star'} size={18} tintColor={fav ? colors.star : colors.onInk} />
          </Animated.View>
          <Text style={[styles.buttonText, fav && { color: colors.text }]}>{fav ? 'In my plan' : 'Add to my plan'}</Text>
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
        <View style={styles.why}>
          <Text style={styles.whyLabel}>Why it’s in your plan</Text>
          <Text style={styles.body}>{entry.rationale}</Text>
          {entry.notes.map((n) => (
            <Text key={n} style={styles.note}>
              {n}
            </Text>
          ))}
        </View>
      )}

      {!session.isService && (
        <Section title="My notes">
          <MyTalkNotes key={session.id} sessionId={session.id} />
        </Section>
      )}

      {!!session.description && (
        <Section title="Abstract">
          <Text style={styles.body}>{session.description}</Text>
        </Section>
      )}

      {speakers.some((sp) => sp.profile) && (
        <Section title={speakers.length > 1 ? 'Speakers' : 'Speaker'}>
          {speakers.map(({ id, profile, photo }) =>
            profile ? (
              <Pressable
                key={id}
                onPress={() => openSpeaker(profile.id)}
                accessibilityRole="button"
                accessibilityLabel={`${profile.name}, bio`}
                style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}
              >
                <Avatars names={[profile.name]} photos={[profile.photoUrl ?? photo]} size={44} />
                <View style={styles.listBody}>
                  <Text style={styles.listTitle}>{profile.name}</Text>
                  {!!profile.tagLine && (
                    <Text style={styles.listMeta} numberOfLines={2}>
                      {profile.tagLine}
                    </Text>
                  )}
                </View>
                <Text style={styles.bioLink}>Bio</Text>
                <SymbolView name="chevron.right" size={13} tintColor={colors.faint} />
              </Pressable>
            ) : null,
          )}
        </Section>
      )}

      {options.length > 0 && (
        <Section title="Other options in this slot">
          {options.map(({ session: o, rationale }) => {
            const chosen = favIds.has(o.id);
            return (
              <View key={o.id} style={styles.listRow}>
                <Pressable style={styles.optionTap} onPress={() => router.replace(`/session/${o.id}`)}>
                  <Cover session={o} size={44} />
                  <View style={styles.listBody}>
                    <Text style={styles.listTitle}>{o.title}</Text>
                    <Text style={styles.listMeta}>
                      {formatTime(o.startsAt)} – {formatTime(o.endsAt)} · {o.room}
                    </Text>
                    <Text style={styles.listMeta}>{rationale}</Text>
                  </View>
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
        </Section>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: gutter, paddingTop: 28, paddingBottom: 48, gap: 16 },
  hero: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  badges: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  title: { ...font.display, color: colors.text },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hosts: { ...font.meta, fontSize: 15, flex: 1, color: colors.muted },
  hostLink: { color: colors.text, fontWeight: '600' },
  info: { gap: 12, marginTop: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1, gap: 1 },
  infoTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  infoSub: { ...font.meta, ...font.time, color: colors.muted },
  button: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.ink,
    paddingVertical: 14,
    borderRadius: radius.control,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonFav: { backgroundColor: colors.fill },
  buttonText: { color: colors.onInk, fontWeight: '600', fontSize: 16 },
  clashBox: { backgroundColor: colors.dangerBg, padding: 14, borderRadius: radius.tile, gap: 4 },
  clashTitle: { ...font.meta, fontWeight: '600', color: colors.danger },
  clashItem: { ...font.meta, fontWeight: '400', color: colors.danger },
  why: { backgroundColor: colors.card, padding: 16, borderRadius: radius.card, borderCurve: 'continuous', gap: 6 },
  whyLabel: { ...font.meta, fontWeight: '600', color: colors.muted },
  note: { ...font.meta, fontWeight: '400', lineHeight: 19, color: colors.danger },
  body: { ...font.body, color: colors.text },
  section: {
    gap: 10,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectionTitle: { ...font.title, color: colors.text },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, borderRadius: radius.tile },
  pressed: { backgroundColor: colors.fill },
  optionTap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  listBody: { flex: 1, gap: 2 },
  listTitle: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2, color: colors.text },
  listMeta: { ...font.meta, fontWeight: '400', color: colors.muted },
  bioLink: { ...font.meta, fontWeight: '600', color: colors.text },
  switch: { backgroundColor: colors.ink, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  switchText: { color: colors.onInk, fontWeight: '600', fontSize: 13 },
  missing: { padding: 32, textAlign: 'center', color: colors.muted },
});
