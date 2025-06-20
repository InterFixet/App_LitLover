import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export default function ProgressScreen({ route }) {
  const navigation = useNavigation();
  const { book } = route.params;
  const [pagesToday, setPagesToday] = useState('');
  const [pagesRead, setPagesRead] = useState(book.pagesRead || 0);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [newPagesRead, setNewPagesRead] = useState('');
  const [isMarkModalVisible, setIsMarkModalVisible] = useState(false);
  const [pagesTodayInput, setPagesTodayInput] = useState('');
  const [totalPages, setTotalPages] = useState(book.totalPages);

  const progress = totalPages ? Math.min((pagesRead / totalPages) * 100, 100) : 0;

  const handleCreateNote = () => {
    navigation.navigate('NoteEditorScreen', { 
      book: {
        id: book.id,
        title: book.title,
        authors: book.authors,
        thumbnail: book.thumbnail,
        pagesRead: book.pagesRead,
        totalPages: book.totalPages,
        status: book.status,
        notes: book.notes || [],
        quotes: book.quotes || [],
        lastNote: book.lastNote,
        lastQuote: book.lastQuote
      }
    });
  };

  // Функция для сохранения прочитанных сегодня страниц
const handleMarkPages = async () => {
  const pagesNumber = parseInt(pagesTodayInput);
  if (isNaN(pagesNumber) || pagesNumber <= 0) {
    Alert.alert('Ошибка', 'Введите корректное число страниц');
    return;
  }

  const updatedPages = Math.min(pagesRead + pagesNumber, totalPages);
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    const user = auth.currentUser;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const allBooks = userSnap.data().books || [];

    const updatedBook = {
      ...book,
      pagesRead: updatedPages,
      readDates: [...(book.readDates || []), todayStr],
    };

    const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);

    await updateDoc(userRef, { books: updatedBooks });
    setPagesRead(updatedPages);
    setPagesTodayInput('');
    setIsMarkModalVisible(false);
    Alert.alert('Успех', 'Прогресс обновлён!');
  } catch (error) {
    console.error(error);
    Alert.alert('Ошибка', 'Не удалось обновить прогресс');
  }
};

  const handleSaveProgress = async () => {
    const pages = parseInt(newPagesRead);
    if (isNaN(pages) || pages <= 0) {
        Alert.alert('Ошибка', 'Введите корректное число страниц');
        return;
    }

    try {
        const user = auth.currentUser;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const allBooks = userSnap.data().books || [];

        const updatedBook = {
        ...book,
        totalPages: pages, // 💡 Сохраняем введённое общее число страниц
        };

        const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);
        await updateDoc(userRef, { books: updatedBooks });

        setTotalPages(pages);
        setPagesRead(updatedBook.pagesRead || 0);
        setIsUpdateModalVisible(false);
        setNewPagesRead('');
        Alert.alert('Успех', 'Общее количество страниц сохранено!');
    } catch (error) {
        console.error('Ошибка обновления прогресса:', error);
        Alert.alert('Ошибка', 'Не удалось сохранить общее количество страниц');
    }
    };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Image source={require('../../assets/Vector.png')} />
      </TouchableOpacity>
      <Text style={[styles.title, {marginBottom: 40}]}>Прогресс</Text>

      <Text style={styles.subtitle}>Отметьте количество страниц в выбранной книге</Text>

      <TouchableOpacity style={styles.markButton}
      onPress={() => setIsUpdateModalVisible(true)}>
        <Text style={styles.markButtonText}>Отметить</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isMarkModalVisible}
        onRequestClose={() => setIsMarkModalVisible(false)}
        >
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
        >
            <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Сколько страниц вы прочитали сегодня?</Text>
            <TextInput
                style={[styles.input, { alignSelf: 'center' }]}
                placeholder="..."
                keyboardType="numeric"
                value={pagesTodayInput}
                onChangeText={setPagesTodayInput}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                style={[styles.button, styles.saveButton, { left: 80 }]}
                onPress={handleMarkPages}
                >
                <Text style={styles.buttonText}>Сохранить</Text>
                </TouchableOpacity>
            </View>
            </View>
        </KeyboardAvoidingView>
        </Modal>

      <AnimatedCircularProgress
        size={300}
        width={20}
        fill={progress}
        tintColor="#FF85A2"
        backgroundColor="#FADADD"
        rotation={0}
        style={{ marginTop: 20 }}
      >
        {
          () => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{Math.round(progress)}%</Text>
              <Text style={{ fontSize: 20 }}>прочитано</Text>
              <Text style={{ fontSize: 18 }}>{pagesRead} из {totalPages} страниц</Text>
            </View>
          )
        }
      </AnimatedCircularProgress>

      <Text style={[styles.subtitle, {marginTop: 20, marginBottom: 10}]}>Сколько страниц вы прочитали сегодня?</Text>
      <Text style={[styles.subtitle, {marginBottom: 20}]}>Давайте обновим прогресс!</Text>

      <TouchableOpacity style={styles.updateButton} onPress={() => setIsMarkModalVisible(true)}>
        <Text style={styles.updateButtonText}>Обновить</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isUpdateModalVisible}
        onRequestClose={() => setIsUpdateModalVisible(false)}
        >
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
        >
            <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Укажите количество страниц книги, которую вы читаете: </Text>
            <TextInput
                style={[styles.input, {alignSelf: 'center'}]}
                placeholder="..."
                keyboardType="numeric"
                value={newPagesRead}
                onChangeText={setNewPagesRead}
            />
            <Text style={[styles.modalTitle, {fontSize: 16}]}>Нажмите, чтобы ввести число</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                style={[styles.button, styles.saveButton, {left: 80}]}
                onPress={handleSaveProgress}
                >
                <Text style={styles.buttonText}>Сохранить</Text>
                </TouchableOpacity>
            </View>
            </View>
        </KeyboardAvoidingView>
        </Modal>

      {/* Дополнительные действия */}
      <View style={[styles.actions, {flexDirection: 'row', right: 10}]}>
        <View style = {{flexDirection: 'column'}}>
            <Text style={[styles.subtitle, {marginBottom: 0}]}>Появились мысли?</Text>
            <Text style={styles.subtitle}>Запиши их</Text>
        </View>
        <TouchableOpacity style={[styles.actionBtn, {flexDirection: 'row', marginBottom: 40}]}
        onPress={handleCreateNote}>
                  <Image 
                    source={require('../../assets/List.png')}
                    style={[styles.icon, {right: 25}]}
                  />
                  <View style={{ marginLeft: -25, bottom: 5 }}>
                    <Text style={[styles.itemText, {fontWeight: '800'}]}>Создать</Text>
                    <Text style={[styles.itemText, { bottom: 4, fontWeight: '800'}]}>заметку</Text>
                  </View>
        </TouchableOpacity>
      </View>
      <View style={[styles.actions, {flexDirection: 'row', right: 10}]}>
        <View style = {{flexDirection: 'column'}}>
            <Text style={[styles.subtitle, {marginBottom: 0}]}>Можете засечь время</Text>
            <Text style={styles.subtitle}>Вашего чтения!</Text>
        </View> 
        <TouchableOpacity style={[styles.actionBtn, {flexDirection: 'row', marginBottom: 40}]}>
                  <Image 
                    source={require('../../assets/Time.png')}
                    style={[styles.icon, {right: 25}]}
                  />
                  <Text style={[styles.itemText, {marginLeft: -25, top: 1, fontWeight: '800'}]}>Таймер</Text>
                </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8EDEB',
    alignItems: 'center',
    paddingTop: 60,
  },
  back: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
    icon: {
    width: 30,
    height: 30,
    marginRight: 8,
    bottom: 2,
    marginLeft: 19
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    width: 250,
  },
  markButton: {
    backgroundColor: '#B5EAD7',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginTop: 5,
  },
  markButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  input: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    width: '60%',
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#B5EAD7',
    width: 100
  },
  updateButton: {
    backgroundColor: '#B5EAD7',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 30,
    width: 150,
    height: 40
  },
  updateButtonText: {
    fontSize: 18,
    bottom: 3,
    alignSelf: 'center',
    fontWeight: 'bold',
    color: '#222',
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
  },
  actionBtn: {
    backgroundColor: '#B5EAD7',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 30,
    width: 150,
    height: 43
  },
  actionText: {
    fontSize: 18,
    bottom: 3,
    fontWeight: 'bold',
    color: '#222',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: '#F8EDEB',
    padding: 20,
    borderRadius: 20, 
    maxHeight: '80%', 
    borderWidth: 2,
    margin: 20,
    borderColor: '#BF9D99',
    marginBottom: 10,
    height: 360
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '320',
    marginBottom: 20,
    textAlign: 'center',
  },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
        },
    button: {
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 20,
        alignItems: 'center',
        width: 200
    },
    saveButton: {
    backgroundColor: '#B5EAD7',
    },
    buttonText: {
    color: '#333',
    fontWeight: 'bold',
    },
});