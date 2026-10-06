import { StyleSheet, Text, View } from 'react-native';

import { colors } from './theme.ts';

// Soft, muted tones so a row of speakers never turns into a rainbow.
const TONES = ['#E8D9C9', '#D6E2D3', '#D7DCEB', '#EAD5DC', '#DCD7EA', '#D3E4E6'];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function tone(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}

/** Overlapping initials, like the host row on a Luma event. */
export function Avatars({ names, size = 22 }: { names: string[]; size?: number }) {
  const shown = names.slice(0, 3);
  return (
    <View style={styles.row}>
      {shown.map((name, i) => (
        <View
          key={name}
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: tone(name),
              marginLeft: i === 0 ? 0 : -size / 4,
            },
          ]}
        >
          <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials(name)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.card },
  text: { fontWeight: '700', color: '#3A3B3D' },
});
