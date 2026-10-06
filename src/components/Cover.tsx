import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { trackColor } from '../lib/tracks.ts';
import type { Session } from '../lib/types.ts';
import { colors } from './theme.ts';

type Symbol = 'cup.and.saucer.fill' | 'fork.knife' | 'person.text.rectangle.fill' | 'person.3.fill' | 'mic.fill';

/** Icon for sessions without a speaker photo. */
function symbolFor(session: Session): Symbol {
  const t = session.title.toLowerCase();
  if (/lunch|dinner|food/.test(t)) return 'fork.knife';
  if (/break|coffee/.test(t)) return 'cup.and.saucer.fill';
  if (/registration|check-in/.test(t)) return 'person.text.rectangle.fill';
  if (/network|meetup|gathering|party|roundtable/.test(t)) return 'person.3.fill';
  return 'mic.fill';
}

/** Speaker photo that fades in once it has loaded. */
export function Photo({ uri, size, radius }: { uri: string; size: number; radius: number }) {
  const opacity = useState(() => new Animated.Value(0))[0];
  return (
    <Animated.Image
      source={{ uri }}
      onLoad={() => Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start()}
      style={{ width: size, height: size, borderRadius: radius, opacity, backgroundColor: colors.fill }}
    />
  );
}

/**
 * Luma puts a square cover on every event. A talk's cover is its first speaker's
 * photo; anything without one gets a gradient of its track colour and an icon.
 */
export function Cover({ session, size }: { session: Session; size: number }) {
  const radius = size * 0.22;
  const photo = session.speakerPhotos?.find((p): p is string => !!p);
  const color = session.isService ? '#A7A9AC' : trackColor(session.track);
  const extra = session.speakers.length - 1;

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: radius,
          experimental_backgroundImage: `linear-gradient(140deg, ${color}38 0%, ${color}14 100%)`,
        },
      ]}
    >
      {photo ? (
        <Photo uri={photo} size={size} radius={radius} />
      ) : (
        <SymbolView name={symbolFor(session)} size={size * 0.38} tintColor={color} />
      )}
      {photo && extra > 0 && size >= 48 && (
        <View style={styles.more}>
          <Text style={styles.moreText}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderCurve: 'continuous' },
  more: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#131517B3',
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  moreText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
});
