import React from 'react';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';

export default function TimerScreen({ route, navigation }) {
  const { book } = route.params;
  const [isRead, setIsRead] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  const title = book.title || 'Без названия';
  const authors = book.authors || 'Автор неизвестен';
  const thumbnail = book.thumbnail;
  const pagesRead = book.pagesRead || 0;
  const totalPages = book.totalPages || 0;
  const lastNote = book.lastNote || 'Нет заметок';

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      if (!hasStarted) setHasStarted(true);
      intervalRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
      setIsRunning(true);
    }
  };

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

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setSecondsElapsed(0);
    setIsRunning(false);
    setHasStarted(false);
  };

  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const seconds = (secs % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Очистка интервала при размонтировании компонента
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', zIndex: 1}}>
        <TouchableOpacity 
          style={{marginTop: 77, marginLeft: 25}} 
          onPress={() => navigation.goBack()}
        >
          <Image source={require('../../assets/Vector.png')} />
        </TouchableOpacity>
        <Text style={[styles.mainTitle, {marginLeft: 130, marginTop: 70, marginBottom: 0}]}>Таймер</Text>
      </View>

      <View style={[styles.timerContainer, { zIndex: 1 }]}>
        <Text style={styles.timerText}>{formatTime(secondsElapsed)}</Text>

        <TouchableOpacity 
          style={[styles.timerButton, {backgroundColor: isRunning ? '#FFD1DC' : '#FFD1DC'}]} 
          onPress={toggleTimer}
        >
          <Image 
            source={
              !hasStarted || !isRunning 
                ? require('../../assets/start.png') 
                : require('../../assets/pause.png')
            }
            style={styles.timerIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.resetButton]} 
          onPress={resetTimer}
        >
          <Text style={[styles.resetButtonText]}>Сбросить таймер</Text>
        </TouchableOpacity>
      </View>

      <View style={{position: 'absolute', zIndex: 0}}>
        <Image
          source={require('../../assets/Ellipse4.png')}
          style={{width: 500, height: 340, left: 100, bottom: 60 }}
        />
      </View>

      <View style={{position: 'absolute', zIndex: 0, top: 650, left: -59}}>
        <Image 
          source={require('../../assets/Ellipse3.png')}
          style={styles.ellipse}
        />
      </View>
      
      <View style={[styles.shadowContainer, {marginTop: 150}]}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.cover} resizeMode="contain" />
        ) : (
          <Image source={require('../../assets/BookDark.png')} style={styles.cover} resizeMode="contain" />
        )}
      </View>

      <View style={{marginLeft: 250, bottom: 245}}>
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
        
        <TouchableOpacity style={[styles.greenText, {flexDirection: 'row', marginBottom: 40}]}>
          <Image 
            source={require('../../assets/MessingL.png')}
            style={[styles.icon, {marginLeft: 10}]}
          />
          <View style={{ marginLeft: 1, bottom: 5 }}>
            <Text style={styles.itemText}>Поставить</Text>
            <Text style={[styles.itemText, { bottom: 4 }]}>напоминание</Text>
          </View>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 4,
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
    width: 180,
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
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    // твои стили заголовка
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  timerButton: {
    width: 160,
    height: 160,
    borderRadius: 100,
    borderWidth: 10,
    backgroundColor: '#FFD1DC',
    borderColor: '#FFAFC2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#B5EAD7',
    borderRadius: 30,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});