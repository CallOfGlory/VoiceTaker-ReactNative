import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface BarProps {
  active: boolean;
  color: string;
  delay: number;
}

function Bar({ active, color, delay }: BarProps) {
  const height = useSharedValue(6);

  useEffect(() => {
    if (active) {
      height.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(6 + Math.random() * 26, {
              duration: 260 + Math.random() * 220,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(6 + Math.random() * 10, {
              duration: 260 + Math.random() * 220,
              easing: Easing.inOut(Easing.ease),
            })
          ),
          -1,
          true
        )
      );
    } else {
      height.value = withTiming(6, { duration: 200 });
    }
  }, [active, delay, height]);

  const style = useAnimatedStyle(() => ({ height: height.value }));

  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
}

interface WaveformBarsProps {
  active: boolean;
  barCount?: number;
}

export function WaveformBars({ active, barCount = 24 }: WaveformBarsProps) {
  const { colors } = useTheme();
  const bars = useMemo(() => Array.from({ length: barCount }, (_, i) => i), [barCount]);

  return (
    <View style={styles.row}>
      {bars.map((i) => (
        <Bar key={i} active={active} color={colors.primary} delay={(i % 6) * 60} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 40,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
});
