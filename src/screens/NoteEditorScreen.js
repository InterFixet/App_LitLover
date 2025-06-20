import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { doc, updateDoc, arrayRemove, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';

export default function NoteEditorScreen({ route, navigation }) {
  const { book: initialBook, existingNote } = route.params || {};
  const [book, setBook] = useState(initialBook);
  const [noteText, setNoteText] = useState(existingNote?.text || '');
  const [currentDate, setCurrentDate] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAllNotesModalVisible, setIsAllNotesModalVisible] = useState(false);
  const [tempNoteText, setTempNoteText] = useState('');
  const [isQuoteModalVisible, setIsQuoteModalVisible] = useState(false);
  const [isAllQuotesModalVisible, setIsAllQuotesModalVisible] = useState(false);
  const [tempQuoteText, setTempQuoteText] = useState('');
  const title = book.title || 'Без названия';
  const authors = book.authors || 'Автор неизвестен';
  
  // В начале компонента добавьте функцию для очистки объекта от undefined
  const cleanBookObject = (book) => {
    return JSON.parse(JSON.stringify(book));
  };

  
useEffect(() => {
  const fetchBookFromFirestore = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !initialBook?.id) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const allBooks = userSnap.data().books || [];
      const freshBook = allBooks.find(b => b.id === initialBook.id);

      if (freshBook) {
        setBook(freshBook);
      }
    } catch (error) {
      console.error('Ошибка загрузки книги из Firestore:', error);
    }
  };

  fetchBookFromFirestore();
}, []);
  
  useEffect(() => {
    // Функция для форматирования даты
    const formatDate = () => {
      const date = new Date();
      const month = date.toLocaleDateString('ru-RU', { month: 'long' });
      const year = date.getFullYear();
      // Делаем первую букву заглавной и добавляем запятую
      return `${month.charAt(0).toUpperCase() + month.slice(1)}, ${year}`;
    };
    
    setCurrentDate(formatDate());
  }, []);

  const handleSaveNote = async () => {
    if (!tempNoteText.trim()) {
      Alert.alert('Ошибка', 'Заметка не может быть пустой');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Пользователь не авторизован');

      const userRef = doc(db, 'users', user.uid);

      // Загружаем текущие книги
      const userSnap = await getDoc(userRef);
      const allBooks = userSnap.data().books || [];

      // Создаем новую заметку
      const newNote = {
        id: Date.now().toString(),
        text: tempNoteText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bookId: book.id || '',
        displayDate: new Date().toLocaleDateString('ru-RU') || ''
      };

      // Обновляем книгу
      const updatedBook = {
        ...book,
        notes: [newNote, ...(book.notes || [])],
        lastNote: new Date().toLocaleDateString('ru-RU')
      };

      // Заменяем книгу в массиве
      const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);

      // Обновляем массив книг целиком
      await updateDoc(userRef, {
        books: updatedBooks.map(cleanBookObject)
      });

      setBook(updatedBook);
      Alert.alert('Успех', 'Заметка сохранена');
      setIsModalVisible(false);
      setTempNoteText('');
    } catch (error) {
      console.error('Ошибка сохранения заметки:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось сохранить заметку');
    }
  };


  const handleSaveQuote = async () => {
    if (!tempQuoteText.trim()) {
      Alert.alert('Ошибка', 'Цитата не может быть пустой');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Пользователь не авторизован');

      const userRef = doc(db, 'users', user.uid);

      // Загружаем текущие книги
      const userSnap = await getDoc(userRef);
      const allBooks = userSnap.data().books || [];
      
      const newQuote = {
        id: Date.now().toString(),
        text: tempQuoteText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bookId: book.id || '',
        displayDate: new Date().toLocaleDateString('ru-RU') || ''
      };

      const updatedBook = {
        ...book,
        quotes: [newQuote, ...(book.quotes || [])],
        lastQuote: new Date().toLocaleDateString('ru-RU')
      };

      const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);

      // ❗ Сначала удаляем старую книгу
      await updateDoc(userRef, {
        books: arrayRemove(cleanBookObject(book))
      });

      await updateDoc(userRef, {
        books: updatedBooks.map(cleanBookObject)
      });

      setBook(updatedBook);
      Alert.alert('Успех', 'Цитата сохранена');
      setIsQuoteModalVisible(false);
      setTempQuoteText('');
    } catch (error) {
      console.error('Ошибка сохранения цитаты:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось сохранить цитату');
    }
  };

  const formatNoteDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Получаем последние 2 заметки
  const latestNotes = book.notes?.slice(0, 2) || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity 
                style={{marginTop: 50, marginLeft: 10}} 
                onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/Vector.png')} />
            </TouchableOpacity>
            <Text style={[styles.mainTitle, {marginLeft: 85}]}>Мои заметки</Text>
        </View>

        <View style={{marginTop: -80}}>
            <Image 
                source={require('../../assets/Circles.png')}
                style={{top: 90, marginLeft: 30, zIndex: 0}}
            />
        </View>

        <Text style={[styles.sectionTitle, {marginLeft: 50, fontWeight: 10}]}>
            {typeof authors === 'string' ? authors : authors.join(', ')}
        </Text>
        <Text style={[styles.sectionTitle, {marginLeft: 50, marginTop: 1, fontSize: 30}]}>
            {title}
        </Text>

        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity 
                    style={[styles.greenText, { flexDirection: 'row', width: 210, height: 40, marginLeft: 200, position: 'absolute', top: 45}]}
                    onPress={() => setIsModalVisible(true)}>
                    <Image
                      source={require('../../assets/List.png')}
                      style={{width: 30, height: 30, left:8}}  
                    />
                    <Text style={[styles.itemText, {fontWeight: 600, position: 'absolute', left: 55, top: 8}]}>
                      Новая заметка
                    </Text>
            </TouchableOpacity>
            <Text style={[styles.mainTitle, {marginLeft: 15}]}>{currentDate}</Text>
        </View>

        {/* Отображение заметок */}
        <View style={{marginTop: -10}}>
          {latestNotes.map(note => (
            <View key={note.id} style={styles.noteContainer}>
              <Text style={styles.noteText}>{note.text}</Text>
              <Text style={styles.noteDate}>{formatNoteDate(note.createdAt)}</Text>
            </View>
          ))}
        </View>

      {/* Модальное окно для новой заметки */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Фиксируй свои мысли в заметках</Text>
            
            <TextInput
              style={[styles.input, {height: 150, textAlignVertical: 'center', marginBottom: 60}]}
              placeholder="Добавить заметку..."
              multiline
              value={tempNoteText}
              onChangeText={setTempNoteText}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setTempNoteText('');
                }}
              >
                <Text style={styles.buttonText}>Отменить</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveNote}
              >
                <Text style={styles.buttonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Модальное окно для просмотра всех заметок */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isAllNotesModalVisible}
        onRequestClose={() => setIsAllNotesModalVisible(false)}
      >
        <View style={styles.allNotesContainer}>
          <View style={styles.allNotesHeader}>
            <TouchableOpacity 
              onPress={() => setIsAllNotesModalVisible(false)}
              style={styles.backButton}
            >
              <Image source={require('../../assets/Vector.png')} />
            </TouchableOpacity>
            <Text style={styles.allNotesTitle}>Все заметки</Text>
          </View>
          
          <ScrollView>
            {book.notes?.map(note => (
              <View key={note.id} style={styles.noteContainer}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteDate}>{formatNoteDate(note.createdAt)}</Text>
                </View>
                <Text style={styles.noteText}>{note.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>


        <TouchableOpacity style={{flexDirection: 'row', marginTop: 20}} onPress={() => setIsAllNotesModalVisible(true)}>
            <View style={{width: 130, height: 5, backgroundColor: '#FFD1DC', marginLeft: 15}}></View>
            <View style={{width: 20, height: 20, backgroundColor: '#FFD1DC', marginLeft: 15, bottom: 8}}></View>
            <View style={{width: 20, height: 20, backgroundColor: '#FFD1DC', marginLeft: 15, bottom: 8}}></View>
            <View style={{width: 20, height: 20, backgroundColor: '#FFD1DC', marginLeft: 15, bottom: 8}}></View>
            <View style={{width: 130, height: 5, backgroundColor: '#FFD1DC', marginLeft: 15}}></View>
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, {marginLeft: 15, marginTop: 50, fontWeight: 320}]}>Можете добавить понравившуюся цитату!</Text>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isQuoteModalVisible}
          onRequestClose={() => setIsQuoteModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Сохраняйте любимые цитаты</Text>
              
              <TextInput
                style={[styles.input, {height: 150, textAlignVertical: 'top'}]}
                placeholder="Добавьте цитату..."
                multiline
                value={tempQuoteText}
                onChangeText={setTempQuoteText}
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setIsQuoteModalVisible(false);
                    setTempQuoteText('');
                  }}
                >
                  <Text style={styles.buttonText}>Отменить</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveQuote}
                >
                  <Text style={styles.buttonText}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        {/* Отображение цитат */}
        {book.quotes?.slice(0, 1).map(quote => (
          <View key={quote.id} style={styles.quoteContainer}>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.noteDate}>{formatNoteDate(quote.createdAt)}</Text>
          </View>
        ))}

        <Modal
          animationType="slide"
          transparent={false}
          visible={isAllQuotesModalVisible}
          onRequestClose={() => setIsAllQuotesModalVisible(false)}
        >
          <View style={styles.allNotesContainer}>
            <View style={styles.allNotesHeader}>
              <TouchableOpacity 
                onPress={() => setIsAllQuotesModalVisible(false)}
                style={styles.backButton}
              >
                <Image source={require('../../assets/Vector.png')} />
              </TouchableOpacity>
              <Text style={styles.allNotesTitle}>Все цитаты</Text>
            </View>
            
            <ScrollView>
              {book.quotes?.map(quote => (
                <View key={quote.id} style={styles.noteContainer}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteDate}>{formatNoteDate(quote.createdAt)}</Text>
                  </View>
                  <Text style={styles.noteText}>"{quote.text}"</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>

        <TouchableOpacity style={{flexDirection: 'row', marginTop: 30}}
        onPress={() => setIsAllQuotesModalVisible(true)}>
            <View style={{width: 130, height: 5, backgroundColor: '#FFD1DC', marginLeft: 15}}></View>
            <View style={{width: 20, height: 20, backgroundColor: '#FFD1DC', marginLeft: 15, bottom: 8}}></View>
            <View style={{width: 20, height: 20, backgroundColor: '#FFD1DC', marginLeft: 15, bottom: 8}}></View>
            <View style={{width: 20, height: 20, backgroundColor: '#FFD1DC', marginLeft: 15, bottom: 8}}></View>
            <View style={{width: 130, height: 5, backgroundColor: '#FFD1DC', marginLeft: 15}}></View>
        </TouchableOpacity>
        <TouchableOpacity 
                    style={[styles.greenText, { flexDirection: 'row', width: 210, marginTop: 0, height: 40, alignSelf: 'center', top: 45, backgroundColor: '#FFD1DC'}]}
                    onPress={() => setIsQuoteModalVisible(true)}>
                    <Image
                      source={require('../../assets/List.png')}
                      style={{width: 30, height: 30, left:8}}  
                    />
                    <Text style={[styles.itemText, {fontWeight: 600, position: 'absolute', left: 55, top: 8}]}>
                      Добавить цитату
                    </Text>
            </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8EDEB',
  },
  scrollContainer: {
    paddingBottom: 100, // Добавьте дополнительный отступ снизу
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 45,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  greenText: {
    backgroundColor: '#B5EAD7',
    borderRadius: 25,
    padding: 6,
  },
  itemText: {
    fontSize: 16,
    color: '#000000',
  },
  noteContainer: {
    backgroundColor: '#F5F3EF',
    borderWidth: 2,
    borderColor: '#FFD1DC',
    borderRadius: 10,
    padding: 10,
    margin: 15,
    marginTop: 10,
    minHeight: 50, // Минимальная высота заметки
  },
  noteText: {
    fontSize: 16,
    lineHeight: 22,
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 30,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '320',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#FFD1DC',
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    borderRadius: 200,
    backgroundColor: '#FFCDD2',
  },
  saveButton: {
    backgroundColor: '#C8E6C9',
    borderRadius: 200,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  allNotesContainer: {
    flex: 1,
    backgroundColor: '#F8EDEB',
    paddingTop: 20,

  },
  allNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom:20,
  },
  allNotesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  backButton: {
    padding: 10,
  },
  quoteContainer: {
    backgroundColor: '#F5F3EF',
    borderWidth: 2,
    borderColor: '#FFD1DC',
    borderRadius: 10,
    padding: 10,
    margin: 15,
    marginTop: 20,
    minHeight: 100, // Минимальная высота заметки
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic', // Курсив для цитат
  },
});