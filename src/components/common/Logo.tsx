import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface LogoProps {
  size?: number;
  color?: string;
  background?: string;
}

export function Logo({ size = 64, color = '#FFFFFF', background = '#6C5CE7' }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={32} fill={background} />
      <Rect x={26} y={13} width={12} height={23} rx={6} fill={color} />
      <Path d="M20 29a12 12 0 0 0 24 0" stroke={color} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <Path d="M32 41v7" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      <Path d="M25 48h14" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
    </Svg>
  );
}
