import { StyleSheet, Text, View } from 'react-native';

import { Photo } from './Cover.tsx';
import { colors } from './theme.ts';

// Soft, muted tones so initials never turn a row into a rainbow.
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

/** Overlapping speaker photos (initials when there is none), like the host row on a Luma event. */
export function Avatars({
  names,
  photos = [],
  size = 22,
}: {
  names: string[];
  photos?: (string | null)[];
  size?: number;
}) {
  return (
    <View style={styles.row}>
      {names.slice(0, 3).map((name, i) => {
        const photo = photos[i];
        return (
          <View
            key={name}
            style={[
              styles.avatar,
              {
                width: size + 3,
                height: size + 3,
                borderRadius: (size + 3) / 2,
                backgroundColor: tone(name),
                marginLeft: i === 0 ? 0 : -size / 3,
              },
            ]}
          >
            {photo ? (
              <Photo uri={photo} size={size} radius={size / 2} />
            ) : (
              <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials(name)}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bg,
    overflow: 'hidden',
  },
  text: { fontWeight: '700', color: '#3A3B3D' },
});
