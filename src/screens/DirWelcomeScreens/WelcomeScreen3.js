import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen3() {
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
                <Text style={styles.mainTitle}>Сохраняйте мысли</Text>

                <View style={styles.textBlock}>
                    <Text style={styles.subtitleText}>Выделяй ключевые моменты</Text>
                    <Text style={styles.subtitleText}>Создавай личную</Text>
                    <Text style={styles.subtitleText}>коллекцию мыслей</Text>

                    <TouchableOpacity
                        style={[styles.registerButton, styles.primaryButton]}
                        onPress={() => navigation.navigate('WelcomeScreen4')}
                    >
                        <Text style={styles.actionText}>Дальше</Text>
                    </TouchableOpacity>
                </View >

                <View style={[styles.imagesContainer, { position: 'relative' }]} >
                {/* Изображение книги под текстом */}
                    <Image 
                        source={require('../../../assets/Blocknote.png')}
                        style={[ 
                            styles.bookImage,
                            { 
                            transform: [{ rotate: '-10deg' }],
                            }
                        ]}
                        resizeMode="contain"
                    />
                    <Image 
                        source={require('../../../assets/lamp.png')}
                        style={[
                        styles.bookImage,
                        { 
                            width: 120,  // Новая ширина (было 100 → стало 50)
                            height: 120,
                            transform: [{ rotate: '-25deg' }],
                            position: 'absolute',
                            marginTop: -160,
                            left: -20, // Регулируем расстояние
                            zIndex: 2,
                        } // Наклон влево на 10 градусов
                        ]}
                        resizeMode="contain"
                    />
                    <Image 
                        source={require('../../../assets/lamp.png')}
                        style={[
                        styles.bookImage,
                        { 
                            width: 80,  // Новая ширина (было 100 → стало 50)
                            height: 80,
                            transform: [{ rotate: '-60deg' }],
                            position: 'absolute',
                            marginTop: -80,
                            left: -40,
                            zIndex: 2,
                        } // Наклон влево на 10 градусов
                        ]}
                        resizeMode="contain"
                    />
                    <Image 
                        source={require('../../../assets/lamp.png')}
                        style={[
                        styles.bookImage,
                        { 
                            width: 80,  // Новая ширина (было 100 → стало 50)
                            height: 80,
                            transform: [{ rotate: '10deg' }],
                            position: 'absolute',
                            marginTop: -160,
                            left: 60,
                            zIndex: 2,
                        } // Наклон влево на 10 градусов
                        ]}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8EDEB',
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
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    buttonText: {
        color: '#333',
        fontSize: 10,
        fontWeight: 'bold',
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
    imagesContainer: {
        flexDirection: 'row', // Располагает изображения в строку
        alignItems: 'center', // Выравнивает по центру по вертикали
        gap: 10, // Отступ между изображениями (если поддерживается)
    },
});