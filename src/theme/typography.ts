import { TextStyle } from 'react-native';

type Weight = TextStyle['fontWeight'];

const weight = (w: Weight) => w;

export const typography = {
  largeTitle: { fontSize: 30, fontWeight: weight('800'), lineHeight: 36 },
  title: { fontSize: 22, fontWeight: weight('700'), lineHeight: 28 },
  subtitle: { fontSize: 17, fontWeight: weight('600'), lineHeight: 22 },
  body: { fontSize: 15, fontWeight: weight('400'), lineHeight: 21 },
  bodyMedium: { fontSize: 15, fontWeight: weight('600'), lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: weight('400'), lineHeight: 17 },
  captionMedium: { fontSize: 13, fontWeight: weight('600'), lineHeight: 17 },
  tiny: { fontSize: 11, fontWeight: weight('500'), lineHeight: 14 },
  button: { fontSize: 16, fontWeight: weight('700'), lineHeight: 20 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;
