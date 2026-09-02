import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LyricsStackParamList } from './types';
import { LyricsSearchScreen } from '../screens/lyrics/LyricsSearchScreen';
import { LyricsFavoritesScreen } from '../screens/lyrics/LyricsFavoritesScreen';
import { LyricsDetailScreen } from '../screens/lyrics/LyricsDetailScreen';

const Stack = createNativeStackNavigator<LyricsStackParamList>();

export function LyricsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LyricsSearch" component={LyricsSearchScreen} />
      <Stack.Screen name="LyricsFavorites" component={LyricsFavoritesScreen} />
      <Stack.Screen name="LyricsDetail" component={LyricsDetailScreen} />
    </Stack.Navigator>
  );
}
