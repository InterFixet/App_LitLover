import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../firebase-config';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            // Устанавливаем задержку перед переходом
            setTimeout(() => {
                if (user) {
                    // Пользователь авторизован - переход на Home
                    navigation.replace('HomeScreen');
                } else {
                    navigation.replace('WelcomeScreen1');
                }
            }, 1000); // Задержка в 1 секунду (1000 мс)

        });

        return () => {
            unsubscribe(); // Отписка при размонтировании
        };
    }, [navigation]);
    
    return (
        <View style={styles.container}>
            <Image
                    source={require('../../assets/coffee.png')}
                    style={[styles.bookImage,
                        {
                            width: 160,
                            height: 160,
                            marginLeft: 145,
                            marginTop: 300,
                        }
                    ]}
                    resizeMode="contain"/>
            <View style={styles.content}>
                <Text style={styles.mainTitle}>LitLover</Text>
                <View style={styles.textBlock}>
                    <Text style={ styles.subtitleText }>Трекер вашего чтения</Text>
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: height * 0.1,
    },
    mainTitle: {
        fontSize: 44,
        fontFamily: 'NunitoSans-Bold',
        color: '#73C39D',
        marginBottom: 30,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        position: 'absolute',
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
        fontSize: 28,
        fontFamily: 'NunitoSans-Regular',
        color: '#73C39D',
        lineHeight: 34,
        textAlign: 'center',
    },
    bookImage: {
        width: '100%',
        height: height * 0.25,
        marginTop: 20,
        position: 'absolute',
    },
});