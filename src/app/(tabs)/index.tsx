import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';

import { DataStatus } from '../../components/DataStatus.tsx';
import { EmptyAgenda } from '../../components/EmptyAgenda.tsx';
import { useNow } from '../../components/NextUpBanner.tsx';
import { SessionRow } from '../../components/SessionRow.tsx';
import { colors } from '../../components/theme.ts';
import { TrackChip } from '../../components/TrackChip.tsx';
import { groupByDay, groupByStart } from '../../lib/schedule.ts';
import { dayKey, formatDayLabel, formatTime } from '../../lib/time.ts';
import { useAgenda } from '../../state/AgendaContext.tsx';

export default function AgendaScreen() {
  const { sessions, status, refresh } = useAgenda();
  const now = useNow(60_000);
  const days = useMemo(() => groupByDay(sessions), [sessions]);
  const dayKeys = [...days.keys()];
  const today = dayKey(now);
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const day = pickedDay && days.has(pickedDay) ? pickedDay : days.has(today) ? today : dayKeys[0];

  const tracks = [...new Set(sessions.map((s) => s.track).filter((t): t is string => !!t))].sort();
  const [track, setTrack] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const sections = groupByStart(
    (days.get(day) ?? []).filter(
      (s) =>
        (!track || s.track === track || s.isService) &&
        (!q || `${s.title} ${s.speakers.join(' ')} ${s.room}`.toLowerCase().includes(q)),
    ),
  );

  if (sessions.length === 0) return <EmptyAgenda />;

  return (
    <View style={styles.screen}>
      <DataStatus />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bar}>
        {dayKeys.map((k) => (
          <Pressable key={k} onPress={() => setPickedDay(k)} style={[styles.day, k === day && styles.dayActive]}>
            <Text style={[styles.dayText, k === day && styles.dayTextActive]}>{formatDayLabel(k)}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {tracks.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bar}>
          <Pressable onPress={() => setTrack(null)} style={[styles.allChip, !track && styles.allChipActive]}>
            <Text style={[styles.allText, !track && { color: '#FFFFFF' }]}>All</Text>
          </Pressable>
          {tracks.map((t) => (
            <Pressable key={t} onPress={() => setTrack(track === t ? null : t)} style={{ opacity: !track || track === t ? 1 : 0.4 }}>
              <TrackChip track={t} active={track === t} />
            </Pressable>
          ))}
        </ScrollView>
      )}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search talks, speakers, rooms"
        clearButtonMode="while-editing"
        style={styles.search}
      />
      <SectionList
        sections={sections}
        keyExtractor={(s) => s.id}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <Text style={styles.slot}>{formatTime(section.startsAt)}</Text>
        )}
        renderItem={({ item }) => <SessionRow session={item} past={item.endsAt < now} />}
        refreshControl={<RefreshControl refreshing={status.kind === 'loading'} onRefresh={refresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No talks match.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { paddingHorizontal: 12, paddingVertical: 6, gap: 8, alignItems: 'center' },
  day: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.border },
  dayActive: { backgroundColor: colors.accent },
  dayText: { fontWeight: '600', color: colors.text },
  dayTextActive: { color: '#FFFFFF' },
  allChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: colors.text },
  allChipActive: { backgroundColor: colors.text },
  allText: { fontSize: 12, fontWeight: '600', color: colors.text },
  search: {
    marginHorizontal: 12,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slot: {
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    fontWeight: '700',
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 32 },
});
