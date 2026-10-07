import { SymbolView } from 'expo-symbols';
import { Text } from 'react-native';

import { isAndroid } from './theme.ts';

/**
 * Favourite star. The bundled Material Symbols font only has the outlined star,
 * so Android draws the filled one as a glyph.
 */
export function Star({ filled, size, color }: { filled: boolean; size: number; color: string }) {
  if (filled && isAndroid) {
    return (
      <Text style={{ fontSize: size * 1.15, lineHeight: size * 1.2, color }} accessible={false}>
        ★
      </Text>
    );
  }
  return (
    <SymbolView
      name={{ ios: filled ? 'star.fill' : 'star', android: 'star' }}
      tintColor={color}
      size={size}
      fallback={<Text style={{ fontSize: size * 0.85, color }}>★</Text>}
    />
  );
}
