import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAgenda } from '../state/AgendaContext.tsx';
import { colors, font, radius } from './theme.ts';

export function EmptyAgenda() {
  const { status, refresh } = useAgenda();
  if (status.kind !== 'error') {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={colors.muted} />
        <Text style={styles.text}>Downloading the agenda…</Text>
      </View>
    );
  }
  return (
    <View style={styles.box}>
      <View style={styles.icon}>
        <SymbolView name="wifi.slash" size={26} tintColor={colors.muted} />
      </View>
      <Text style={styles.title}>No agenda yet</Text>
      <Text style={styles.text}>{status.message}</Text>
      <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]} onPress={refresh}>
        <Text style={styles.buttonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10, backgroundColor: colors.bg },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fill,
    marginBottom: 6,
  },
  title: { ...font.display, fontSize: 22, color: colors.text },
  text: { ...font.body, color: colors.muted, textAlign: 'center' },
  button: {
    backgroundColor: colors.ink,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: radius.pill,
    marginTop: 12,
  },
  buttonText: { color: colors.onInk, fontSize: 16, fontWeight: '600' },
});
