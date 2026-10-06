import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ago } from '../../components/DataStatus.tsx';
import { colors } from '../../components/theme.ts';
import { normalizeSessionizeId } from '../../lib/sessionize.ts';
import { useAgenda } from '../../state/AgendaContext.tsx';
import { DEFAULT_SESSIONIZE_ID } from '../../state/agendaSource.ts';
import { LEAD_MINUTES, sendTestNotification } from '../../state/notifications.ts';

function Button({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.button, disabled && { opacity: 0.5 }]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const agenda = useAgenda();
  const { sessions, fetchedAt, sourceIds, manualIds, status, favs, remindersScheduled, notificationsAllowed } = agenda;
  const [input, setInput] = useState(manualIds.join(', '));

  const saveIds = () => {
    const parts = input.split(/[\s,]+/).filter(Boolean);
    const ids = parts.map(normalizeSessionizeId);
    if (ids.some((id) => id === null)) {
      Alert.alert('Invalid ID', 'Paste the Sessionize API ID or a sessionize.com/api/v2/… URL.');
      return;
    }
    agenda.setManualIds(ids as string[]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.h}>Agenda data</Text>
      <View style={styles.card}>
        <Text style={styles.line}>{sessions.length} sessions saved on this phone</Text>
        <Text style={styles.line}>Last updated: {fetchedAt ? ago(fetchedAt) : 'never'}</Text>
        <Text style={styles.line}>Sessionize: {sourceIds.join(', ') || '—'}</Text>
        {status.kind === 'error' && <Text style={styles.error}>{status.message}</Text>}
        <Button
          label={status.kind === 'loading' ? 'Updating…' : 'Update now'}
          onPress={agenda.refresh}
          disabled={status.kind === 'loading'}
        />
      </View>

      <Text style={styles.h}>Sessionize ID (optional)</Text>
      <View style={styles.card}>
        <Text style={styles.hint}>
          Leave empty to use the next.app devCon 2026 agenda ({DEFAULT_SESSIONIZE_ID}). To use another event, paste
          its Sessionize ID or a sessionize.com/api/v2/… URL.
        </Text>
        <TextInput
          value={input}
          onChangeText={setInput}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="e.g. abc123xy"
          style={styles.input}
        />
        <Button label={input.trim() ? 'Save and download' : 'Use default and download'} onPress={saveIds} />
      </View>

      <Text style={styles.h}>Reminders</Text>
      <View style={styles.card}>
        <Text style={styles.line}>
          Notifications: {notificationsAllowed === null ? '…' : notificationsAllowed ? 'allowed' : 'blocked'}
        </Text>
        <Text style={styles.line}>
          {remindersScheduled ?? 0} reminders scheduled, {LEAD_MINUTES} min before each of your {favs.length} favourites
        </Text>
        <Button label="Send a test notification" onPress={() => sendTestNotification(favs[0])} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  h: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginTop: 12 },
  card: { backgroundColor: colors.card, borderRadius: 10, padding: 14, gap: 8 },
  line: { fontSize: 15, color: colors.text },
  hint: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  error: { fontSize: 13, color: colors.danger },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  button: { backgroundColor: colors.accent, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#FFFFFF', fontWeight: '600' },
});
