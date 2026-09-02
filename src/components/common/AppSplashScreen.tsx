import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import { Logo } from './Logo';
import { ColorTokens } from '../../theme/colors';
import { spacing, typography } from '../../theme/typography';

interface AppSplashScreenProps {
  colors: ColorTokens;
  tagline?: string;
}

export function AppSplashScreen({ colors, tagline }: AppSplashScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Logo size={96} background={colors.primary} />
      </Animated.View>
      <Animated.Text style={[typography.title, { color: colors.text, marginTop: spacing.lg, opacity }]}>
        VoiceNotes
      </Animated.Text>
      {tagline ? (
        <Animated.Text
          style={[
            typography.body,
            { color: colors.textSecondary, marginTop: spacing.xs, opacity, textAlign: 'center' },
          ]}
        >
          {tagline}
        </Animated.Text>
      ) : null}
      <ActivityIndicator color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  spinner: {
    marginTop: spacing.xl,
  },
});
