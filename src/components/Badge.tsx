import { StyleSheet, Text, View, type ColorValue } from 'react-native';

import { colors, font, radius, softOf } from './theme.ts';

// Labels read in sentence case ("Top pick"), whatever case callers pass.
const sentence = (label: string) => label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();

/** Soft tinted status pill, like Luma's "Going" and "Waitlisted". */
export function Badge({ label, color }: { label: string; color: ColorValue }) {
  const neutral = color === colors.muted || color === colors.faint;
  return (
    <View style={[styles.badge, { backgroundColor: softOf(color) }]}>
      <Text style={[styles.text, { color: neutral ? colors.muted : color }]}>{sentence(label)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  text: { ...font.caption },
});
