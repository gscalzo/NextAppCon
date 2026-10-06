import { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { DataStatus } from '../../components/DataStatus.tsx';
import { NextUpBanner, useNow } from '../../components/NextUpBanner.tsx';
import { SessionRow } from '../../components/SessionRow.tsx';
import { colors } from '../../components/theme.ts';
import { clashingIds, groupByDay } from '../../lib/schedule.ts';
import { formatDayLabel } from '../../lib/time.ts';
import { useAgenda } from '../../state/AgendaContext.tsx';
import { LEAD_MINUTES } from '../../state/notifications.ts';

export default function FavoritesScreen() {
  const { favs, notificationsAllowed } = useAgenda();
  const now = useNow();
  const clashes = useMemo(() => clashingIds(favs), [favs]);
  const sections = useMemo(
    () => [...groupByDay(favs)].map(([day, data]) => ({ day, data })),
    [favs],
  );

  return (
    <View style={styles.screen}>
      <DataStatus />
      <SectionList
        sections={sections}
        keyExtractor={(s) => s.id}
        ListHeaderComponent={
          <>
            <NextUpBanner />
            {notificationsAllowed === false && (
              <Text style={styles.warning}>
                Notifications are off, so you won’t get the {LEAD_MINUTES}-minute reminders. Enable them for Expo Go
                in iOS Settings.
              </Text>
            )}
            {clashes.size > 0 && (
              <Text style={styles.warning}>⚠︎ Some favourites overlap: they’re highlighted in red.</Text>
            )}
          </>
        }
        renderSectionHeader={({ section }) => <Text style={styles.day}>{formatDayLabel(section.day)}</Text>}
        renderItem={({ item }) => (
          <SessionRow session={item} clash={clashes.has(item.id)} past={item.endsAt < now} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No favourites yet. Tap ★ on a talk in the Agenda and you’ll get a reminder {LEAD_MINUTES} minutes before
            it starts.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  day: { backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, fontWeight: '700', color: colors.text },
  warning: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.dangerBg,
    color: colors.danger,
    fontSize: 13,
  },
  empty: { textAlign: 'center', color: colors.muted, margin: 32, lineHeight: 20 },
});
