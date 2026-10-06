import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAgenda } from '../state/AgendaContext.tsx';
import { colors } from './theme.ts';

export function EmptyAgenda() {
  const { status, refresh } = useAgenda();
  if (status.kind === 'loading' || status.kind === 'idle') {
    return (
      <View style={styles.box}>
        <ActivityIndicator />
        <Text style={styles.text}>Downloading the agenda…</Text>
      </View>
    );
  }
  return (
    <View style={styles.box}>
      <Text style={styles.title}>No agenda yet</Text>
      <Text style={styles.text}>{status.message}</Text>
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={refresh}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondary]} onPress={() => router.push('/settings')}>
          <Text style={[styles.buttonText, { color: colors.accent }]}>Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  text: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: { backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.accent },
  buttonText: { color: '#FFFFFF', fontWeight: '600' },
});
