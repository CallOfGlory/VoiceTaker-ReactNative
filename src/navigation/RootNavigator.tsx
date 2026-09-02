import React from 'react';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { RootTabParamList } from './types';
import { NotesStackNavigator } from './NotesStack';
import { PodcastsStackNavigator } from './PodcastsStack';
import { LyricsStackNavigator } from './LyricsStack';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { MiniPlayerBar } from '../components/player/MiniPlayerBar';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: { backgroundColor: colors.tabBarBackground, borderTopColor: colors.border },
      }}
      tabBar={(props) => (
        <>
          <MiniPlayerBar />
          <BottomTabBar {...props} />
        </>
      )}
    >
      <Tab.Screen
        name="NotesTab"
        component={NotesStackNavigator}
        options={{
          title: t('tabs.notes'),
          tabBarIcon: ({ color, size }) => <Ionicons name="mic-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="PodcastsTab"
        component={PodcastsStackNavigator}
        options={{
          title: t('tabs.podcasts'),
          tabBarIcon: ({ color, size }) => <Ionicons name="headset-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="LyricsTab"
        component={LyricsStackNavigator}
        options={{
          title: t('tabs.lyrics'),
          tabBarIcon: ({ color, size }) => <Ionicons name="musical-notes-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
