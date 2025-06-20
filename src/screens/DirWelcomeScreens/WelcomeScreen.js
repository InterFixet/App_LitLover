import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
	const navigation = useNavigation();

	return (
		<View style={styles.container}>
			{/* Фоновое изображение с летающими листами */}
			<Image
				source={require('../../../assets/book-welcome.png')}
				style={styles.backgroundImage}
				resizeMode="cover"
			/>

			{/* Основной контент */}
			<View style={styles.content}>
				<Text style={styles.mainTitle}>Готовы начать?</Text>

				<View style={styles.textBlock}>
					<Text style={ styles.subtitleText }>Переходите к регистрации</Text>

					<TouchableOpacity
						style={[styles.registerButton, styles.primaryButton]}
						onPress={() => navigation.navigate('AuthScreen')}
					>
						<Text style={styles.actionText}>Перейти к регистрации</Text>
					</TouchableOpacity>

					<Text style={styles.subtitleText}>И начинайте погружение</Text>
					<Text style={styles.subtitleText}>в мир книг!</Text>
				</View>

				{/* Изображение книги под текстом */}
				<Image
					source={require('../../../assets/book-image.png')}
					style={styles.bookImage}
					resizeMode="contain"
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F8EDEB',
	},
	backgroundImage: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		opacity: 0.8,
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
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
		paddingTop: height * 0.1,
	},
	mainTitle: {
		fontSize: 36,
		fontFamily: 'NunitoSans-Bold',
		color: '#333',
		marginBottom: 30,
		textAlign: 'center',
		textShadowColor: 'rgba(0, 0, 0, 0.1)',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
	textBlock: {
		alignItems: 'center',
		backgroundColor: 'rgba(248, 237, 235, 0.85)',
		borderRadius: 20,
		padding: 20,
		width: '100%',
		marginBottom: 20,
	},
	subtitleText: {
		fontSize: 22,
		fontFamily: 'NunitoSans-Regular',
		color: '#555',
		lineHeight: 34,
		textAlign: 'center',
	},
	registerButton: {
		marginVertical: 15,
	},
	actionText: {
		fontSize: 24,
		fontFamily: 'NunitoSans-SemiBold',
		color: '#333',
		lineHeight: 36,
		textAlign: 'center',
		textDecorationLine: 'none',
		textShadowColor: 'rgba(181, 234, 215, 0.3)',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
	bookImage: {
		width: '100%',
		height: height * 0.25,
		marginTop: 20,
	},
});