import { useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ago } from '../../../components/DataStatus.tsx';
import { colors, font, gutter, radius } from '../../../components/theme.ts';
import { normalizeSessionizeId } from '../../../lib/sessionize.ts';
import { useAgenda } from '../../../state/AgendaContext.tsx';
import { DEFAULT_SESSIONIZE_ID } from '../../../state/agendaSource.ts';
import { LEAD_MINUTES, sendTestNotification } from '../../../state/notifications.ts';

function Group({ title, footer, children }: { title: string; footer?: string; children: ReactNode }) {
  return (
    <View style={styles.groupWrap}>
      <Text style={styles.h}>{title}</Text>
      <View style={styles.group}>{children}</View>
      {!!footer && <Text style={styles.footer}>{footer}</Text>}
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Button({
  label,
  onPress,
  disabled,
  destructive,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && { opacity: 0.5 }]}
    >
      <Text style={[styles.buttonText, destructive && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const agenda = useAgenda();
  const { sessions, fetchedAt, sourceIds, manualIds, status, favs, remindersScheduled, notificationsAllowed } = agenda;
  const [input, setInput] = useState(manualIds.join(', '));
  const sendTest = () => {
    const now = Date.now();
    const nextFav = favs.find((s) => s.startsAt > now) ?? favs[0];
    sendTestNotification(nextFav, nextFav && agenda.planEntry(nextFav.id));
  };

  const saveIds = () => {
    const parts = input.split(/[\s,]+/).filter(Boolean);
    const ids = parts.map(normalizeSessionizeId);
    if (ids.some((id) => id === null)) {
      Alert.alert('Invalid ID', 'Paste the Sessionize API ID or a sessionize.com/api/v2/… URL.');
      return;
    }
    agenda.setManualIds(ids as string[]);
  };

  const confirmReset = () =>
    Alert.alert('Restore my plan?', 'Your favourites will be replaced by the 24 talks of your original route.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', style: 'destructive', onPress: agenda.resetToPlan },
    ]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <Group
        title="Reminders"
        footer={`Each reminder arrives ${LEAD_MINUTES} minutes before a favourite and tells you which room to go to.`}
      >
        <Row
          label="Notifications"
          value={notificationsAllowed === null ? '…' : notificationsAllowed ? 'Allowed' : 'Blocked'}
        />
        <Row label="Scheduled" value={String(remindersScheduled ?? 0)} />
        <Button label="Send a test reminder" onPress={sendTest} />
      </Group>

      <Group title="My plan">
        <Row label="Favourites" value={String(favs.length)} />
        <Button label="Restore my original plan" onPress={confirmReset} destructive />
      </Group>

      <Group title="Agenda data" footer={status.kind === 'error' ? status.message : undefined}>
        <Row label="Sessions on this phone" value={String(sessions.length)} />
        <Row label="Last updated" value={fetchedAt ? ago(fetchedAt) : 'Never'} />
        <Row label="Sessionize" value={sourceIds.join(', ') || '—'} />
        <Button
          label={status.kind === 'loading' ? 'Updating…' : 'Update now'}
          onPress={agenda.refresh}
          disabled={status.kind === 'loading'}
        />
      </Group>

      <Group
        title="Sessionize ID"
        footer={`Leave empty to use the next.app devCon 2026 agenda (${DEFAULT_SESSIONIZE_ID}). To use another event, paste its Sessionize ID or a sessionize.com/api/v2/… URL.`}
      >
        <View style={[styles.row, styles.rowDivider]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="e.g. abc123xy"
            placeholderTextColor={colors.faint}
            style={styles.input}
          />
        </View>
        <Button label={input.trim() ? 'Save and download' : 'Use default and download'} onPress={saveIds} />
      </Group>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: gutter, paddingTop: 8, paddingBottom: 48, gap: 24 },
  groupWrap: { gap: 8 },
  h: { ...font.meta, fontWeight: '600', color: colors.muted, marginLeft: 4 },
  group: { backgroundColor: colors.card, borderRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden' },
  footer: { ...font.meta, fontWeight: '400', color: colors.muted, lineHeight: 18, marginHorizontal: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 50,
    paddingHorizontal: 16,
  },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  pressed: { backgroundColor: colors.fill },
  label: { fontSize: 16, color: colors.text },
  value: { fontSize: 16, color: colors.muted, flexShrink: 1, ...font.time },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, color: colors.text },
  buttonText: { fontSize: 16, fontWeight: '500', color: colors.text },
});
