import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/DirWelcomeScreens/WelcomeScreen';
import WelcomeScreen1 from '../screens/DirWelcomeScreens/WelcomeScreen1';
import WelcomeScreen2 from '../screens/DirWelcomeScreens/WelcomeScreen2';
import WelcomeScreen3 from '../screens/DirWelcomeScreens/WelcomeScreen3';
import WelcomeScreen4 from '../screens/DirWelcomeScreens/WelcomeScreen4';
import AuthScreen from '../screens/AuthScreen'; 
import HomeScreen from '../screens/HomeScreen'; 
import LoadingScreen from '../screens/LoadingScreen'; 
import SearchScreen from '../screens/SearchScreen';
import AddBookScreen from '../screens/AddBookScreen';
import CollectionSearchScreen from '../screens/CollectionSearchScreen';
import BookDetailScreen from '../screens/BookDetailScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';
import ProgressScreen from '../screens/ProgressScreen';
import TimerScreen from '../screens/TimerScreen';
import NotificationScreen from '../screens/NotificationScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoadingScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
        <Stack.Screen name="WelcomeScreen1" component={WelcomeScreen1} />
        <Stack.Screen name="WelcomeScreen2" component={WelcomeScreen2} />
        <Stack.Screen name="WelcomeScreen3" component={WelcomeScreen3} />
        <Stack.Screen name="WelcomeScreen4" component={WelcomeScreen4} />
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="AuthScreen" component={AuthScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="AddBookScreen" component={AddBookScreen} />
        <Stack.Screen name="CollectionSearchScreen" component={CollectionSearchScreen} />
        <Stack.Screen name="BookDetailScreen" component={BookDetailScreen} />
        <Stack.Screen name="NoteEditorScreen" component={NoteEditorScreen} />
        <Stack.Screen name="ProgressScreen" component={ProgressScreen} />
        <Stack.Screen name="TimerScreen" component={TimerScreen} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
