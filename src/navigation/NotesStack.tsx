import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NotesStackParamList } from './types';
import { NotesListScreen } from '../screens/notes/NotesListScreen';
import { RecordScreen } from '../screens/notes/RecordScreen';
import { NotePlayerScreen } from '../screens/notes/NotePlayerScreen';
import { CategoryManagerScreen } from '../screens/notes/CategoryManagerScreen';

const Stack = createNativeStackNavigator<NotesStackParamList>();

export function NotesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotesList" component={NotesListScreen} />
      <Stack.Screen name="Record" component={RecordScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="NotePlayer" component={NotePlayerScreen} />
      <Stack.Screen name="CategoryManager" component={CategoryManagerScreen} />
    </Stack.Navigator>
  );
}
