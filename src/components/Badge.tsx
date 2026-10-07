import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, softOf } from './theme.ts';

// Labels read in sentence case ("Top pick"), whatever case callers pass.
const sentence = (label: string) => label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();

/**
 * Soft tinted status pill, like Luma's "Going" and "Waitlisted". `solid` puts it
 * on white so it stays readable on top of a photo.
 */
export function Badge({ label, color, solid = false }: { label: string; color: string; solid?: boolean }) {
  const neutral = color === colors.muted || color === colors.faint;
  return (
    <View style={[styles.badge, solid ? styles.solid : { backgroundColor: softOf(color) }]}>
      <Text style={[styles.text, { color: neutral ? colors.muted : color }]}>{sentence(label)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  solid: { backgroundColor: '#FFFFFF', boxShadow: '0px 1px 4px rgba(19, 21, 23, 0.16)' },
  text: { ...font.caption },
});
