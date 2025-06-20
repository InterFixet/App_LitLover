import React, { useCallback, useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { PermissionsAndroid, Platform } from 'react-native';
import { View } from 'react-native';
import PushNotification from 'react-native-push-notification';
import AppNavigator from './navigation/AppNavigator'; // Убрали лишний src/

SplashScreen.preventAutoHideAsync();

async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Разрешение на уведомления не получено');
    }
  }
}

export default function App() {
	const [fontsLoaded] = useFonts({
		'NunitoSans-Regular': require('./assets/fonts/NunitoSans-Regular.ttf'),
		'NunitoSans-SemiBold': require('./assets/fonts/NunitoSans-SemiBold.ttf'),
		'NunitoSans-Bold': require('./assets/fonts/NunitoSans-Bold.ttf'),
	});

	const onLayoutRootView = useCallback(async () => {
		if (fontsLoaded) {
			await SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<View style={{ flex: 1 }} onLayout={onLayoutRootView}>
			<AppNavigator />
		</View>
	);
}