import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { doc, setDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';

export default function AddBookScreen({ route, navigation }) {
  const { book } = route.params;

  const title = book.title || 'Без названия';
  const authors = book.authors?.join(', ') || 'Автор неизвестен';
  const thumbnail = book.imageLinks?.thumbnail;

  const handleAddBook = async (status) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Ошибка', 'Пользователь не авторизован');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const bookData = {
        id: book.id || Date.now().toString(),
        title,
        authors,
        thumbnail: book.imageLinks?.thumbnail || null, // безопасно
        status,
        addedAt: new Date().toISOString()
      };

      await setDoc(userRef, {
        books: arrayUnion(bookData)
      }, { merge: true });

      Alert.alert('Успешно', `Книга добавлена в "${status}"`, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
      // Обновляем параметр для триггера обновления
      navigation.navigate('HomeScreen', { refresh: true });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить книгу');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
        <View style={{flexDirection: 'row', zIndex: 1}}>
            <TouchableOpacity 
                style={{marginTop: 77, marginLeft: 25}} 
                onPress={() => navigation.goBack()}>
                <Image 
                    source={require('../../assets/Vector.png')}
                ></Image>
            </TouchableOpacity>
            <Text style={[styles.mainTitle, {marginLeft: 90, marginTop: 70}]}>Поиск книги</Text>
        </View>
        <View style={{position: 'absolute', zIndex: 0}}>
            <Image
                source={require('../../assets/Ellipse.png')}
                style={{width: 400, height: 530}}
            ></Image>
        </View>

        <Text style={[styles.sectionTitle, {marginLeft: 60, marginTop: 20, fontWeight: 10}]}>{authors}</Text>
        <Text style={[styles.sectionTitle, {marginLeft: 60, marginTop: 1, fontSize: 30, marginBottom: 40}]}>{title}</Text>
        
        <View style={[styles.shadowContainerr, {alignSelf: 'center'}]}>
            {thumbnail ? (
                <Image source={{ uri: thumbnail }} style={[styles.cover, {width: 230, height: 350, marginBottom: 40}]} resizeMode="contain" />
            ) : (
                <Image source={require('../../assets/BookDark.png')} style={styles.cover} resizeMode="contain" />
            )}
        </View>
        <Text style={[styles.mainTitle, {textAlign: 'center', marginTop: 0, marginLeft: 0}]}>Выберите, что хотите</Text>
        <Text style={[styles.mainTitle, {textAlign: 'center', marginTop: -26, marginLeft: 0}]}>сделать с книгой:</Text>
        <Text style={[styles.sectionTitle, {marginTop: -5, marginLeft: 20, fontWeight: '400'}]}>Книга будет добавлена в соответствующий раздел в зависимости от Вашего выбора</Text>
        <View style={{flexDirection: 'row', marginTop: 50}}>
        <TouchableOpacity 
          style={[styles.greenText, {marginBottom: 40, marginLeft: 30}]}
          onPress={() => handleAddBook('Читаю сейчас')}>
          <Text style={[styles.itemText, {top: 1, alignSelf: 'center', marginLeft: 20}]}>Читать сейчас</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.greenText, {marginBottom: 40, marginLeft: 30}]}
          onPress={() => handleAddBook('Планирую')}>
          <View style={{ marginLeft: 1, bottom: 5, alignSelf: 'center'}}>
            <Text style={styles.itemText}>Планирую</Text>
            <Text style={[styles.itemText, { bottom: 4 }]}>прочитать</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.greenText, {marginBottom: 40, marginLeft: 30}]}
          onPress={() => handleAddBook('Прочитано')}>
          <View style={{ alignSelf: 'center', bottom: -2 }}>
            <Text style={styles.itemText}>Прочитано</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8EDEB' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 20 },
  backText: { fontSize: 16, color: '#007AFF' },
  cover: { width: 180, height: 290, marginLeft: -20, bottom: 30 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  authors: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 30 },
  mainTitle: {
    fontSize: 28,
    marginLeft: 115,
    marginTop: 45,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
    itemText: {
    fontSize: 16,
    color: '#000000',
  },
  shadowContainer: {
    paddingHorizontal: -10,
    alignSelf: 'flex-start',
    marginTop: 30,
    marginLeft: 30,
    backgroundColor: 'transparent', // Обязательно для тени!
    elevation: 15, 
  },
    greenText: {
        backgroundColor: '#B5EAD7',
        borderRadius: 25,
        width: 110,
        height: 40,
        padding: 6,
        paddingBottom: 10,
  },
});