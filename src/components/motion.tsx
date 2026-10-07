import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, LayoutAnimation, type StyleProp, type ViewStyle } from 'react-native';

/** True when the user asked iOS to reduce motion; animations then jump to their end state. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

/**
 * Fades and lifts its children in on mount; `index` staggers siblings. Rows past the
 * first screenful (index 10+) mount while scrolling, so they appear without animating.
 */
export function FadeIn({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const progress = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      delay: Math.min(index, 8) * 40,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, index]);
  if (reduced || index >= 10) return <Animated.View style={style}>{children}</Animated.View>;
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** Spring scale for press feedback: spread `handlers` on the Pressable and `style` on an inner Animated.View. */
export function usePressScale(pressedScale = 0.97) {
  const scale = useState(() => new Animated.Value(1))[0];
  const to = (value: number) =>
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return {
    style: { transform: [{ scale }] },
    handlers: { onPressIn: () => to(pressedScale), onPressOut: () => to(1) },
  };
}

/** A quick pop, for the favourite star. */
export function usePop() {
  const scale = useState(() => new Animated.Value(1))[0];
  const pop = () => {
    scale.setValue(0.6);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 14 }).start();
  };
  return { style: { transform: [{ scale }] }, pop };
}

/** Soft looping pulse for live dots. */
export function usePulse(active: boolean) {
  const opacity = useState(() => new Animated.Value(1))[0];
  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, opacity]);
  return { opacity };
}

/** Animates the next layout change (rows appearing, filters switching). */
export function animateNextLayout() {
  LayoutAnimation.configureNext(LayoutAnimation.create(260, 'easeInEaseOut', 'opacity'));
}
