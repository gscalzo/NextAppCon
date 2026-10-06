import { Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text } from 'react-native';

import { DataStatus } from '../../../components/DataStatus.tsx';
import { EmptyAgenda } from '../../../components/EmptyAgenda.tsx';
import { NowLine } from '../../../components/NowLine.tsx';
import { NowNextCard } from '../../../components/NowNext.tsx';
import { SessionRow } from '../../../components/SessionRow.tsx';
import { colors } from '../../../components/theme.ts';
import { useNow } from '../../../components/useNow.ts';
import { otherOptions } from '../../../lib/plan.ts';
import { clashingIds, groupByDay, nowLineIndex } from '../../../lib/schedule.ts';
import { formatDayLabel } from '../../../lib/time.ts';
import type { Session } from '../../../lib/types.ts';
import { useAgenda } from '../../../state/AgendaContext.tsx';
import { LEAD_MINUTES } from '../../../state/notifications.ts';

type Item =
  | { kind: 'fav'; key: string; session: Session }
  | { kind: 'alt'; key: string; session: Session }
  | { kind: 'now'; key: string };

export default function PlanScreen() {
  const { sessions, favs, favIds, sessionsById, planEntry, notificationsAllowed, status, refresh } = useAgenda();
  const now = useNow();
  const [showAlternatives, setShowAlternatives] = useState(true);
  const clashes = clashingIds(favs);

  const sections = [...groupByDay(favs)].map(([day, dayFavs]) => {
    const data: Item[] = [];
    const nowAt = nowLineIndex(dayFavs, now);
    dayFavs.forEach((session, i) => {
      if (i === nowAt) data.push({ kind: 'now', key: `now-${day}` });
      data.push({ kind: 'fav', key: session.id, session });
      const entry = planEntry(session.id);
      if (!showAlternatives || !entry) return;
      for (const option of otherOptions(entry, session.id)) {
        const alt = sessionsById.get(option.id);
        if (alt && !favIds.has(alt.id)) data.push({ kind: 'alt', key: `${session.id}-${alt.id}`, session: alt });
      }
    });
    if (nowAt === dayFavs.length) data.push({ kind: 'now', key: `now-${day}` });
    return { day, data };
  });

  if (sessions.length === 0) return <EmptyAgenda />;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => setShowAlternatives((v) => !v)}
              hitSlop={10}
              accessibilityLabel={showAlternatives ? 'Hide alternatives' : 'Show alternatives'}
            >
              <SymbolView
                name={showAlternatives ? 'rectangle.stack.fill' : 'rectangle.stack'}
                tintColor={colors.accent}
                size={22}
              />
            </Pressable>
          ),
        }}
      />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.key}
        contentInsetAdjustmentBehavior="automatic"
        style={styles.screen}
        stickySectionHeadersEnabled={false}
        refreshControl={<RefreshControl refreshing={status.kind === 'loading'} onRefresh={refresh} />}
        ListHeaderComponent={
          <>
            <DataStatus />
            <NowNextCard />
            {notificationsAllowed === false && (
              <Text style={styles.warning}>
                Notifications are off, so you won’t get the {LEAD_MINUTES}-minute “go to” reminders. Enable them for
                Expo Go in iOS Settings.
              </Text>
            )}
            {clashes.size > 0 && <Text style={styles.warning}>Some favourites overlap: they’re marked CLASH.</Text>}
          </>
        }
        renderSectionHeader={({ section }) => <Text style={styles.day}>{formatDayLabel(section.day)}</Text>}
        renderItem={({ item }) => {
          if (item.kind === 'now') return <NowLine now={now} />;
          if (item.kind === 'alt') return <SessionRow session={item.session} now={now} compact />;
          return <SessionRow session={item.session} now={now} clash={clashes.has(item.session.id)} />;
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No favourites. Star talks in All talks, or restore your plan in Settings.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  day: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 6,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  warning: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.dangerBg,
    color: colors.danger,
    fontSize: 13,
    overflow: 'hidden',
  },
  empty: { textAlign: 'center', color: colors.muted, margin: 32, lineHeight: 20 },
});
