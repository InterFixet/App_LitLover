import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Image,
	ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithCustomToken } from 'firebase/auth'; 
import { auth } from '../../firebase-config';

const BACKEND_URL = 'http://10.0.2.2:3000';

export default function AuthScreen() {
	const [regEmail, setRegEmail] = useState('');
	const [regPassword, setRegPassword] = useState('');
	const [loginEmail, setLoginEmail] = useState('');
	const [loginPassword, setLoginPassword] = useState('');
	const [isLoginMode, setIsLoginMode] = useState(false);
	const [isAgreed, setIsAgreed] = useState(false);

	const navigation = useNavigation();

	useEffect(() => {
		GoogleSignin.configure({
		webClientId: '647148914810-kb45b86sbdchpbk9pbv96ae9pp0ssjlh.apps.googleusercontent.com',
		offlineAccess: true, // Для получения refresh token
  		forceCodeForRefreshToken: true, // Для Android
	}); }, []);

	const handleGoogle = async () => {
		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();
			console.log('User info:', userInfo);
			const idToken = userInfo.data.idToken;

			console.log('Client idToken:', idToken);

			// Отправь idToken на бэкенд, чтобы получить кастомный токен
			const response = await fetch('http://10.0.2.2:3000/google-login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken }),
			});

			if (!response.ok) {
				throw new Error('Ошибка на сервере: ' + response.status);
			}

			const { customToken } = await response.json();

			await signInWithCustomToken(auth, customToken);
			navigation.replace('HomeScreen');
		} catch (error) {
			console.error('Ошибка Google входа:', error);
		}
	};

	const handleRegister = async () => {
		try {
			const response = await fetch(`${BACKEND_URL}/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: regEmail,
					password: regPassword
				}),
			});

			const data = await response.json();

			if (!response.ok) {
			// Проверяем, содержит ли ошибка информацию о существующем пользователе
				if (response.status === 400 && data.error) {
					alert(`⚠️ ${data.error}⚠️`);
				} else {
					alert(`🚨 Ошибка: ${data.message || 'Неизвестная ошибка регистрации'}🚨`);
				}
      			return;
			}

			await signInWithCustomToken(auth, data.token);
			navigation.replace('HomeScreen');

		} catch (error) {
			Alert.alert(
				'⛔Ошибка регистрации', 
				error.message || 'Не удалось зарегистрироваться. Попробуйте позже⛔'
			);
			console.error('Registration error:', error);
		}
    };

	const handleLogin = async () => {
		try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword
                }),
            });

        const data = await response.json();

        if (response.ok) {
            await signInWithCustomToken(auth, data.token);
            navigation.replace('HomeScreen');
        } else {
            alert(data.message || 'Неверные данные');
        }
        } catch (error) {
            alert('Ошибка сервера при входе');
            console.error(error);
        }
	};

	const toggleAuthMode = () => {
		setIsLoginMode(!isLoginMode);
	};

	return (
		<ScrollView
			contentContainerStyle={styles.container}
			keyboardShouldPersistTaps="handled"
		>
			{!isLoginMode && (
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Text style={styles.backButtonText}>← Назад</Text>
				</TouchableOpacity>
			)}

			<Image
				source={require('../../assets/coffee.png')}
				style={styles.logo}
			/>

			{!isLoginMode ? (
				<>
					<Text style={styles.title}>Регистрация</Text>
					<TextInput
						style={styles.input}
						placeholder="Email"
						value={regEmail}
						onChangeText={setRegEmail}
						keyboardType="email-address"
						autoCapitalize="none"
					/>
					<TextInput
						style={styles.input}
						placeholder="Пароль"
						secureTextEntry
						value={regPassword}
						onChangeText={setRegPassword}
					/>

					<View style={styles.checkboxContainer}>
						<TouchableOpacity
							style={[styles.checkbox, isAgreed && styles.checked]}
							onPress={() => setIsAgreed(!isAgreed)}
						>
							{isAgreed && <Text style={styles.checkmark}>✓</Text>}
						</TouchableOpacity>
						<Text style={styles.agreementText}>
							Я даю согласие на обработку персональных данных
						</Text>
					</View>

					<TouchableOpacity
						style={[
							styles.primaryButton,
							!isAgreed && styles.disabledButton
						]}
						onPress={handleRegister}
						disabled={!isAgreed}
					>
						<Text style={styles.buttonText}>Зарегистрироваться</Text>
					</TouchableOpacity>

					<View style={styles.separator}>
						<View style={styles.line} />
						<Text style={styles.orText}>или</Text>
						<View style={styles.line} />
					</View>

					<TouchableOpacity style={styles.oauthButton} onPress={handleGoogle}> 
						<View style={styles.oauthButtonContent}>
							<Image
								source={require('../../assets/google.png')}
								style={styles.oauthIcon}
							/>
							<Text style={styles.oauthText}>Войти с помощью Google</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity onPress={toggleAuthMode}>
						<Text style={styles.switchText}>
							Уже есть аккаунт? <Text style={styles.switchLink}>Войти</Text>
						</Text>
					</TouchableOpacity>
				</>
			) : (
				<>
					<Text style={styles.title}>Войти</Text>
					<TextInput
						style={styles.input}
						placeholder="Email"
						value={loginEmail}
						onChangeText={setLoginEmail}
						keyboardType="email-address"
						autoCapitalize="none"
					/>
					<TextInput
						style={styles.input}
						placeholder="Пароль"
						secureTextEntry
						value={loginPassword}
						onChangeText={setLoginPassword}
					/>
					<TouchableOpacity
						style={styles.primaryButton}
						onPress={handleLogin}
					>
						<Text style={styles.buttonText}>Войти</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={toggleAuthMode}>
						<Text style={styles.switchText}>
							Нет аккаунта? <Text style={styles.switchLink}>Зарегистрироваться</Text>
						</Text>
					</TouchableOpacity>
				</>
			)}
		</ScrollView>
	);
}


const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 24,
		alignItems: 'center',
		backgroundColor: '#F8EDEB',
		justifyContent: 'center',
	},
	backButton: {
		position: 'absolute',
		top: 48,
		left: 24,
		zIndex: 10,
	},
	backButtonText: {
		fontSize: 16,
		fontFamily: 'NunitoSans-SemiBold',
		color: '#B5EAD7',
	},
	logo: {
		width: 100,
		height: 100,
		resizeMode: 'contain',
		marginBottom: 32,
	},
	title: {
		fontSize: 24,
		fontFamily: 'NunitoSans-Bold',
		marginBottom: 24,
		color: '#333',
	},
	input: {
		width: '100%',
		height: 50,
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 25,
		paddingHorizontal: 20,
		backgroundColor: '#fff',
		marginBottom: 16,
		fontSize: 16,
		fontFamily: 'NunitoSans-Regular',
	},
	primaryButton: {
		width: '100%',
		height: 50,
		backgroundColor: '#B5EAD7',
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		elevation: 3,
	},
	disabledButton: {
		opacity: 0.6,
	},
	buttonText: {
		color: '#000',
		fontFamily: 'NunitoSans-SemiBold',
		fontSize: 16,
	},
	oauthButton: {
		width: '100%',
		height: 56,
		borderWidth: 1,
		borderRadius: 28,
		borderColor: '#ddd',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 12,
		backgroundColor: '#fff',
		paddingHorizontal: 16,
	},
	oauthButtonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		justifyContent: 'center',
	},
	oauthIcon: {
		width: 32,
		height: 32,
		marginRight: 16,
		resizeMode: 'contain',
	},
	oauthText: {
		fontSize: 16,
		color: '#333',
		fontFamily: 'NunitoSans-Regular',
		flex: 1,
		textAlign: 'center',
		marginRight: 32,
	},
	separator: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 20,
		width: '100%',
	},
	line: {
		flex: 1,
		height: 1,
		backgroundColor: '#ccc',
	},
	orText: {
		marginHorizontal: 10,
		fontSize: 16,
		color: '#666',
		fontFamily: 'NunitoSans-Regular',
	},
	switchText: {
		marginTop: 20,
		color: '#666',
		fontSize: 16,
		fontFamily: 'NunitoSans-Regular',
	},
	switchLink: {
		color: '#B5EAD7',
		fontFamily: 'NunitoSans-SemiBold',
	},
	checkboxContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
		width: '100%',
	},
	checkbox: {
		width: 20,
		height: 20,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 10,
	},
	checked: {
		backgroundColor: '#B5EAD7',
		borderColor: '#B5EAD7',
	},
	checkmark: {
		color: '#fff',
		fontSize: 12,
		fontWeight: 'bold',
	},
	agreementText: {
		fontSize: 14,
		color: '#666',
		fontFamily: 'NunitoSans-Regular',
	},
});