import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, ripple } from './theme.ts';

const OUTER = 999;
const INNER = 8;

/**
 * M3 Expressive connected button group, Android's take on a segmented control:
 * segments sit 2dp apart with small inner corners, and the selected one turns
 * primary and fully round.
 */
export function ButtonGroup({
  values,
  selectedIndex,
  onChange,
  style,
}: {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: object;
}) {
  return (
    <View style={[styles.group, style]} accessibilityRole="tablist">
      {values.map((label, i) => {
        const selected = i === selectedIndex;
        const first = i === 0;
        const last = i === values.length - 1;
        const shape = selected
          ? { borderRadius: OUTER }
          : {
              borderTopLeftRadius: first ? OUTER : INNER,
              borderBottomLeftRadius: first ? OUTER : INNER,
              borderTopRightRadius: last ? OUTER : INNER,
              borderBottomRightRadius: last ? OUTER : INNER,
            };
        return (
          <View key={label} style={[styles.segment, shape, selected && styles.selected]}>
            <Pressable
              onPress={() => !selected && onChange(i)}
              android_ripple={ripple}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={styles.press}
            >
              <Text style={[styles.label, selected && styles.selectedLabel]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row', gap: 2 },
  segment: { flex: 1, overflow: 'hidden', backgroundColor: colors.fill },
  selected: { backgroundColor: colors.ink },
  press: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  label: { ...font.meta, fontSize: 14, fontWeight: '600', color: colors.text },
  selectedLabel: { color: colors.onInk },
});
