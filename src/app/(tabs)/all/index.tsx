import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';

import { ButtonGroup } from '../../../components/ButtonGroup.tsx';
import { DataStatus } from '../../../components/DataStatus.tsx';
import { EmptyAgenda } from '../../../components/EmptyAgenda.tsx';
import { animateNextLayout } from '../../../components/motion.tsx';
import { NowLine } from '../../../components/NowLine.tsx';
import { SessionRow } from '../../../components/SessionRow.tsx';
import { colors, font, gutter, isAndroid, radius } from '../../../components/theme.ts';
import { TrackChip } from '../../../components/TrackChip.tsx';
import { useNow } from '../../../components/useNow.ts';
import { groupByDay, groupByStart, nowLineIndex } from '../../../lib/schedule.ts';
import { dayKey, formatDayLabel } from '../../../lib/time.ts';
import type { Session } from '../../../lib/types.ts';
import { useAgenda } from '../../../state/AgendaContext.tsx';

type Section = { key: string; startsAt: number; now: boolean; data: Session[] };

export default function AllTalksScreen() {
  const { sessions, status, refresh } = useAgenda();
  const now = useNow();
  const days = useMemo(() => groupByDay(sessions), [sessions]);
  const dayKeys = [...days.keys()];
  const today = dayKey(now);
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const day = pickedDay && days.has(pickedDay) ? pickedDay : days.has(today) ? today : dayKeys[0];

  const tracks = [...new Set(sessions.map((s) => s.track).filter((t): t is string => !!t))].sort();
  const [track, setTrack] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const slots = groupByStart(
    (days.get(day) ?? []).filter(
      (s) =>
        (!track || s.track === track || s.isService) &&
        (!q || `${s.title} ${s.speakers.join(' ')} ${s.room} ${s.track ?? ''}`.toLowerCase().includes(q)),
    ),
  );
  const nowAt = nowLineIndex(
    slots.map((slot) => ({ startsAt: slot.startsAt, endsAt: Math.max(...slot.data.map((s) => s.endsAt)) })),
    now,
  );
  const sections: Section[] = slots.map((slot) => ({
    key: String(slot.startsAt),
    startsAt: slot.startsAt,
    now: false,
    data: slot.data,
  }));
  if (nowAt !== -1) sections.splice(nowAt, 0, { key: 'now', startsAt: now, now: true, data: [] });

  if (sessions.length === 0) return <EmptyAgenda />;

  return (
    <>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: 'Talks, speakers, rooms',
            onChangeText: (e) => setQuery(e.nativeEvent.text),
            onCancelButtonPress: () => setQuery(''),
            hideWhenScrolling: false,
          },
        }}
      />
      <SectionList
        sections={sections}
        keyExtractor={(s) => s.id}
        contentInsetAdjustmentBehavior="automatic"
        style={styles.screen}
        stickySectionHeadersEnabled={false}
        refreshControl={<RefreshControl refreshing={status.kind === 'loading'} onRefresh={refresh} />}
        ListHeaderComponent={
          <View style={styles.controls}>
            <DataStatus />
            {isAndroid ? (
              <ButtonGroup
                values={dayKeys.map(formatDayLabel)}
                selectedIndex={Math.max(0, dayKeys.indexOf(day))}
                onChange={(i) => {
                  animateNextLayout();
                  setPickedDay(dayKeys[i]);
                }}
                style={styles.segmented}
              />
            ) : (
              <SegmentedControl
                values={dayKeys.map(formatDayLabel)}
                selectedIndex={Math.max(0, dayKeys.indexOf(day))}
                onChange={(e) => {
                  animateNextLayout();
                  setPickedDay(dayKeys[e.nativeEvent.selectedSegmentIndex]);
                }}
                style={styles.segmented}
              />
            )}
            {tracks.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                <Pressable
                  onPress={() => {
                    animateNextLayout();
                    setTrack(null);
                  }}
                  style={[styles.allChip, !track && styles.allChipActive]}
                >
                  <Text style={[styles.allText, !track && styles.allTextActive]}>All tracks</Text>
                </Pressable>
                {tracks.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => {
                      animateNextLayout();
                      setTrack(track === t ? null : t);
                    }}
                  >
                    <TrackChip track={t} active={track === t} />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (section.now ? <NowLine now={now} /> : <View style={styles.slot} />)}
        renderItem={({ item, index }) => <SessionRow session={item} now={now} index={index} />}
        ListEmptyComponent={<Text style={styles.empty}>No talks match.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  controls: { gap: 12, paddingTop: 4, paddingBottom: 8 },
  segmented: { marginHorizontal: gutter },
  chips: { paddingHorizontal: gutter, gap: 8, alignItems: 'center' },
  allChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.fill },
  allChipActive: { backgroundColor: colors.ink },
  allText: { ...font.caption, fontSize: 13, color: colors.text },
  allTextActive: { color: colors.onInk },
  // Tiles already show each start time, so slots are separated by a hairline, not a heading.
  slot: {
    marginHorizontal: gutter,
    marginTop: 6,
    marginBottom: 2,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  empty: { ...font.body, textAlign: 'center', color: colors.muted, marginTop: 40 },
});
