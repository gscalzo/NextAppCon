import { StyleSheet, Text, View, type ColorValue } from 'react-native';

export function Badge({ label, color }: { label: string; color: ColorValue }) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});
