import React from 'react';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { getDoc } from 'firebase/firestore';

export default function BookDetailScreen({ route, navigation }) {
  const { book } = route.params;
  const [isRead, setIsRead] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [currentBook, setCurrentBook] = useState(book);
  const [loading, setLoading] = useState(true);

  const thumbnail = book.thumbnail;

  const { title, authors, totalPages = 0, pagesRead = 0, lastNote = null } = currentBook;

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

  const handleMarkAsRead = async () => {
    if (!isRead) {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        
        // Обновляем статус книги в базе данных
        await updateDoc(userRef, {
          books: arrayRemove(book)
        });
        
        const updatedBook = {
          ...book,
          notes: [newNote, ...(book.notes || [])],
          lastNote: new Date().toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long' // "мая" вместо "05"
          }) // Теперь будет "12 мая"
        };
        
        await updateDoc(userRef, {
          books: arrayUnion(updatedBook)
        });

        setIsRead(true);
        Alert.alert('Успех', 'Книга отмечена как прочитанная');
      } catch (error) {
        console.error('Ошибка при обновлении статуса:', error);
        Alert.alert('Ошибка', 'Не удалось обновить статус книги');
      }
    }
  };

  const handleDeleteBook = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      
      // Удаляем книгу из базы данных
      await updateDoc(userRef, {
        books: arrayRemove(book)
      });

      setIsDeleted(true);
      Alert.alert('Успех', 'Книга удалена из вашей коллекции');
      navigation.goBack(); // Возвращаемся на предыдущий экран
    } catch (error) {
      console.error('Ошибка при удалении книги:', error);
      Alert.alert('Ошибка', 'Не удалось удалить книгу');
    }
  };

  // При загрузке экрана
  useEffect(() => {
    const loadState = async () => {
      const savedRead = await AsyncStorage.getItem(`book_${book.id}_read`);
      const savedDeleted = await AsyncStorage.getItem(`book_${book.id}_deleted`);
      if (savedRead) setIsRead(JSON.parse(savedRead));
      if (savedDeleted) setIsDeleted(JSON.parse(savedDeleted));
    };
    loadState();
  }, []);

  const formatDayMonth = (dateString) => {
    try {
      const [day, month, year] = dateString.split(/[.,\s]+/);
      return `${day}.${month}`;
    } catch {
      return dateString;
    }
  };

  // При изменении состояния
  useEffect(() => {
    AsyncStorage.setItem(`book_${book.id}_read`, JSON.stringify(isRead));
  }, [isRead]);

  useEffect(() => {
    AsyncStorage.setItem(`book_${book.id}_deleted`, JSON.stringify(isDeleted));
  }, [isDeleted]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUpdatedBook = async () => {
        const user = auth.currentUser;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const books = userSnap.data().books || [];
        const updated = books.find(b => b.id === book.id);
        if (updated) {
        setCurrentBook(updated); // 💥 Обновляем состояние — и все данные перерисуются
        }
      };
      fetchUpdatedBook();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', zIndex: 1}}>
        <TouchableOpacity 
          style={{marginTop: 77, marginLeft: 25}} 
          onPress={() => navigation.goBack()}
        >
          <Image source={require('../../assets/Vector.png')} />
        </TouchableOpacity>
        <Text style={[styles.mainTitle, {marginLeft: 120, marginTop: 70}]}>О книге</Text>
      </View>
      
      <View style={{position: 'absolute', zIndex: 0}}>
        <Image
          source={require('../../assets/Ellipse.png')}
          style={{width: 400, height: 530}}
        />
      </View>

      <Text style={[styles.sectionTitle, {marginLeft: 60, marginTop: 20, fontWeight: 10}]}>
        {typeof authors === 'string' ? authors : authors.join(', ')}
      </Text>
      <Text style={[styles.sectionTitle, {marginLeft: 60, marginTop: 1, fontSize: 30}]}>
        {title}
      </Text>
      
      <View style={styles.shadowContainer}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.cover} resizeMode="contain" />
        ) : (
          <Image source={require('../../assets/BookDark.png')} style={styles.cover} resizeMode="contain" />
        )}
      </View>

      <View style={{marginLeft: 250, bottom: 285}}>
        <TouchableOpacity style={[styles.greenText, {flexDirection: 'row', marginBottom: 40}]}
        onPress={() => navigation.navigate('ProgressScreen', { book })}>
          <Image 
            source={require('../../assets/Progress.png')}
            style={styles.icon}
          />
          <Text style={[styles.itemText, {top: 1}]}>Прогресс</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.greenText, {flexDirection: 'row', marginBottom: 40}]}
          onPress={handleCreateNote}>
          <Image 
            source={require('../../assets/List.png')}
            style={styles.icon}
          />
          <View style={{ marginLeft: 1, bottom: 5 }}>
            <Text style={styles.itemText}>Создать</Text>
            <Text style={[styles.itemText, { bottom: 4 }]}>заметку</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.greenText, {flexDirection: 'row', marginBottom: 40}]}
          onPress={() => navigation.navigate('NotificationScreen', { book })}>
          <Image 
            source={require('../../assets/MessingL.png')}
            style={[styles.icon, {marginLeft: 20}]}
          />
          <View style={{ marginLeft: 1, bottom: 5 }}>
            <Text style={styles.itemText}>Поставить</Text>
            <Text style={[styles.itemText, { bottom: 4 }]}>напоминание</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.greenText, {flexDirection: 'row', marginBottom: 40}]}
        onPress={() => navigation.navigate('TimerScreen', { book })}>
          <Image 
            source={require('../../assets/Time.png')}
            style={styles.icon}
          />
          <Text style={[styles.itemText, {top: 1}]}>Таймер</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{marginTop: -80}}>
        <Image 
          source={require('../../assets/Ellipse2.png')}
          style={styles.ellipse}
        />
      </View>
      
      <Text style={styles.progressText}>  
        Прочитано: {pagesRead} из {totalPages} страниц  
      </Text>  
      <Text style={styles.noteText}>
        {lastNote ? `Последняя заметка: ${formatDayMonth(lastNote)}` : 'Заметок пока нет'}
      </Text>

      <TouchableOpacity 
        style={[
          styles.greenText, 
          { 
            marginTop: -160, 
            marginLeft: 70, 
            backgroundColor: isRead ? '#B5EAD7' : '#FFD1DC',
            opacity: isRead ? 0.7 : 1
          }
        ]}
        onPress={handleMarkAsRead}
        disabled={isRead}
      >
        <Text style={[styles.sectionTitle, {alignSelf: 'center'}]}>
          {isRead ? 'Книга прочитана' : 'Отметить прочитанным'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.greenText, 
          { 
            marginTop: 40, 
            marginLeft: 70, 
            backgroundColor: isDeleted ? '#B5EAD7' : '#FFD1DC',
            opacity: isDeleted ? 0.7 : 1
          }
        ]}
        onPress={handleDeleteBook}
        disabled={isDeleted}
      >
        <Text style={[styles.sectionTitle, {alignSelf: 'center'}]}>
          {isDeleted ? 'Книга удалена' : 'Удалить книгу'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8EDEB' 
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
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
    backgroundColor: 'transparent',
    elevation: 15,
  },
  cover: { 
    width: 220, 
    height: 290, 
    marginLeft: -20 
  },
  greenText: {
    backgroundColor: '#B5EAD7',
    borderRadius: 25,
    width: 300,
    height: 40,
    padding: 6,
    paddingBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 8,
    bottom: 2,
    marginLeft: 19
  },
  ellipse: {
    bottom: 140,
    marginLeft: 60,
  },
  progressText: {
    bottom: 240, 
    marginLeft: 50, 
    fontSize: 20
  },
  noteText: {
    bottom: 220, 
    marginLeft: 150, 
    fontSize: 20
  }
});