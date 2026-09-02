export interface ColorTokens {
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  primary: string;
  primaryMuted: string;
  onPrimary: string;
  accent: string;
  danger: string;
  dangerMuted: string;
  success: string;
  warning: string;
  overlay: string;
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  sliderMin: string;
  sliderMax: string;
  shadow: string;
}

export const lightColors: ColorTokens = {
  background: '#F4F5FB',
  surface: '#FFFFFF',
  surfaceVariant: '#ECEDF7',
  card: '#FFFFFF',
  border: '#E1E2ED',
  text: '#191A23',
  textSecondary: '#6B6D80',
  textInverse: '#FFFFFF',
  primary: '#6C5CE7',
  primaryMuted: '#EDE9FD',
  onPrimary: '#FFFFFF',
  accent: '#00B8A9',
  danger: '#E5484D',
  dangerMuted: '#FBE3E3',
  success: '#2FB870',
  warning: '#F5A623',
  overlay: 'rgba(17, 17, 26, 0.45)',
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#6C5CE7',
  tabBarInactive: '#9B9DB0',
  sliderMin: '#6C5CE7',
  sliderMax: '#DDDEEC',
  shadow: 'rgba(30, 30, 60, 0.12)',
};

export const darkColors: ColorTokens = {
  background: '#111119',
  surface: '#1B1B26',
  surfaceVariant: '#24242F',
  card: '#1F1F2B',
  border: '#2E2E3B',
  text: '#F2F2F7',
  textSecondary: '#9698AC',
  textInverse: '#111119',
  primary: '#8C7CFB',
  primaryMuted: '#2A2445',
  onPrimary: '#111119',
  accent: '#2DD9C6',
  danger: '#FF6B6E',
  dangerMuted: '#3A2226',
  success: '#3FD07E',
  warning: '#FFB84D',
  overlay: 'rgba(0, 0, 0, 0.6)',
  tabBarBackground: '#1B1B26',
  tabBarActive: '#8C7CFB',
  tabBarInactive: '#6E6F82',
  sliderMin: '#8C7CFB',
  sliderMax: '#33333F',
  shadow: 'rgba(0, 0, 0, 0.4)',
};

export const categoryPalette = [
  '#6C5CE7',
  '#00B8A9',
  '#E5484D',
  '#F5A623',
  '#2FB870',
  '#3B82F6',
  '#EC4899',
  '#8B5E34',
];
