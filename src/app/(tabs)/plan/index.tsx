import { Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState, type ReactNode } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';

import { DataStatus } from '../../../components/DataStatus.tsx';
import { DayHeader } from '../../../components/DayHeader.tsx';
import { EmptyAgenda } from '../../../components/EmptyAgenda.tsx';
import { NowLine } from '../../../components/NowLine.tsx';
import { NowNextCard } from '../../../components/NowNext.tsx';
import { SessionRow } from '../../../components/SessionRow.tsx';
import { colors, font, gutter, radius } from '../../../components/theme.ts';
import { useNow } from '../../../components/useNow.ts';
import { otherOptions } from '../../../lib/plan.ts';
import { clashingIds, groupByDay, nowLineIndex } from '../../../lib/schedule.ts';
import type { Session } from '../../../lib/types.ts';
import { useAgenda } from '../../../state/AgendaContext.tsx';
import { LEAD_MINUTES } from '../../../state/notifications.ts';

type Item =
  | { kind: 'fav'; key: string; session: Session }
  | { kind: 'alt'; key: string; session: Session }
  | { kind: 'now'; key: string };

function Notice({
  icon,
  tone,
  children,
}: {
  icon: 'bell.slash' | 'exclamationmark.triangle';
  tone: 'muted' | 'danger';
  children: ReactNode;
}) {
  const color = tone === 'danger' ? colors.danger : colors.muted;
  return (
    <View style={[styles.notice, tone === 'danger' && styles.noticeDanger]}>
      <SymbolView name={icon} size={16} tintColor={color} />
      <Text style={[styles.noticeText, { color }]}>{children}</Text>
    </View>
  );
}

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
                tintColor={colors.text}
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
              <Notice icon="bell.slash" tone="muted">
                Notifications are off, so you won’t get the {LEAD_MINUTES}-minute “go to” reminders. Enable them for
                Expo Go in iOS Settings.
              </Notice>
            )}
            {clashes.size > 0 && (
              <Notice icon="exclamationmark.triangle" tone="danger">
                Some favourites overlap. They’re marked Clash.
              </Notice>
            )}
          </>
        }
        renderSectionHeader={({ section }) => <DayHeader day={section.day} now={now} />}
        renderItem={({ item }) => {
          if (item.kind === 'now') return <NowLine now={now} />;
          if (item.kind === 'alt') return <SessionRow session={item.session} now={now} compact />;
          return <SessionRow session={item.session} now={now} clash={clashes.has(item.session.id)} />;
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}>
              <SymbolView name="star" size={24} tintColor={colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>Your plan is empty</Text>
            <Text style={styles.empty}>Star talks in All talks, or restore your plan in Settings.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: gutter - 4,
    marginTop: 8,
    padding: 14,
    borderRadius: radius.control,
    borderCurve: 'continuous',
    backgroundColor: colors.fill,
  },
  noticeDanger: { backgroundColor: colors.dangerBg },
  noticeText: { ...font.meta, flex: 1, lineHeight: 18 },
  emptyBox: { alignItems: 'center', gap: 8, paddingHorizontal: 40, paddingTop: 48 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fill,
    marginBottom: 4,
  },
  emptyTitle: { ...font.title, color: colors.text },
  empty: { ...font.body, textAlign: 'center', color: colors.muted },
});
