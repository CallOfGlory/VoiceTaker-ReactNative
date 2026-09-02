import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PodcastsStackParamList } from './types';
import { PodcastSearchScreen } from '../screens/podcasts/PodcastSearchScreen';
import { PodcastDetailScreen } from '../screens/podcasts/PodcastDetailScreen';

const Stack = createNativeStackNavigator<PodcastsStackParamList>();

export function PodcastsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PodcastSearch" component={PodcastSearchScreen} />
      <Stack.Screen name="PodcastDetail" component={PodcastDetailScreen} />
    </Stack.Navigator>
  );
}
