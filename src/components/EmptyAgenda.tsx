import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAgenda } from '../state/AgendaContext.tsx';
import { colors } from './theme.ts';

export function EmptyAgenda() {
  const { status, refresh } = useAgenda();
  if (status.kind !== 'error') {
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
      <Pressable style={styles.button} onPress={refresh}>
        <Text style={styles.buttonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, backgroundColor: colors.bg },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  text: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  button: { backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginTop: 8 },
  buttonText: { color: '#FFFFFF', fontWeight: '600' },
});
