import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import ToggleSwitch from '../components/ToggleSwitch';

export default function NotificationScreen({ route, navigation }) {
  const { book } = route.params;
  const [date, setDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [time, setTime] = useState({ hours: 12, minutes: 0 });
  const [tempTime, setTempTime] = useState({ hours: 12, minutes: 0 });

  const STORAGE_KEY = `notification_settings_${book.id}`;
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Загрузка сохраненных настроек
  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
          if (jsonValue) {
            const savedSettings = JSON.parse(jsonValue);
            console.log('Загруженные настройки:', savedSettings);

            // Устанавливаем состояние переключателя из сохраненных настроек
            setNotificationsEnabled(savedSettings.notificationsEnabled || false);

            if (savedSettings.time) {
              const [hours, minutes] = savedSettings.time.split(':').map(Number);
              const date = new Date();
              date.setHours(hours);
              date.setMinutes(minutes);
              setDate(date);
              setTempDate(date);
              setTime({ hours, minutes });
              setTempTime({ hours, minutes });
            }

            setSelectedDays(savedSettings.selectedDays || []);
          }
        } catch (e) {
          console.error('Ошибка загрузки настроек:', e);
        }
      };
      loadSettings();
    }, [])
  );

  // Сохранение настроек при изменении
  useEffect(() => {
    const saveSettings = async () => {
      try {
        const settings = {
          notificationsEnabled,
          selectedDays,
          time: `${time.hours}:${time.minutes}`,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Ошибка сохранения:', error);
      }
    };
    saveSettings();
  }, [notificationsEnabled, selectedDays, time]);

  const handleToggleNotifications = async (value) => {
      setNotificationsEnabled(value);
  };

  const handleTimeConfirm = () => {
    setTime(tempTime);
    const newDate = new Date();
    newDate.setHours(tempTime.hours);
    newDate.setMinutes(tempTime.minutes);
    setDate(newDate);
  };

  const handleTimeChange = (newDate) => {
    setTempTime({
      hours: newDate.getHours(),
      minutes: newDate.getMinutes()
    });
    setTempDate(newDate);
  };

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };
  

  return (
    <View style={styles.container}>
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity 
            style={{marginTop: 77, marginLeft: 25}} 
            onPress={() => navigation.goBack()}>
            <Image source={require('../../assets/Vector.png')} />
            </TouchableOpacity>
            <Text style={[styles.mainTitle, {marginLeft: 90, marginTop: 70, marginBottom: 30}]}>Напоминание</Text>
        </View>
        <Text style={styles.sectionTitle}>Хотите ли вы получать напоминания о чтении?</Text>
        <View style={{ marginLeft: 20, marginTop: 20, marginBottom: 20 }}>
            <ToggleSwitch
              isOn={notificationsEnabled}
              onToggle={handleToggleNotifications}
            />
        </View>
        <Text style={styles.sectionTitle}>Давайте найдём идеальное время для чтения!</Text>
        <Text style={[styles.sectionTitle, {marginBottom: 16}]}>Во сколько вам удобно?</Text>

        <View style={
            {backgroundColor: '#F5F3EF', 
            borderRadius: 10, 
            borderWidth: 2, 
            borderColor: '#FFD1DC',
            width: 350,
            height: 180,
            top: 300,
            alignSelf: 'center',
            position: 'absolute'}}>
        </View>

        <View style={
            {backgroundColor: '#FFD1DC',  
            width: 300,
            height: 3,
            top: 364,
            alignSelf: 'center',
            position: 'absolute',
            zIndex: 2}}>
        </View>

        <View style={
            {backgroundColor: '#FFD1DC',  
            width: 300,
            height: 3,
            top: 414,
            alignSelf: 'center',
            position: 'absolute',
            zIndex: 2}}>
        </View>

        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <DatePicker
            mode="time"
            date={new Date(tempDate)}
            onDateChange={handleTimeChange}  // обновляем tempDate при каждом изменении
            locale="ru"
            is24hourSource="locale"
            textColor="#000"
            fadeToColor="none"
            style={{ alignSelf: 'center' }}
          />

          <TouchableOpacity
            onPress={handleTimeConfirm}
            style={{
              marginTop: 20,
              backgroundColor: '#FFD1DC',
              padding: 10,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text>Подтвердить</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, {marginTop: 40}]}>Как часто вы планируете читать?</Text>
        <Text style={[styles.itemText, {marginLeft: 20, marginTop: 15}]}>Пн, Вт, Ср, Чт, Пт, Сб, Вс</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 20 }}>
            {days.map(day => (
            <TouchableOpacity
              key={day}
              onPress={() => toggleDay(day)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: selectedDays.includes(day) ? '#B5EAD7' : '#CACACA'
              }}
            >
              <Text>{day}</Text>
            </TouchableOpacity>
            ))}
            </View>

        <View style={{alignSelf: 'center', bottom: 285}}>
            <TouchableOpacity style={[styles.greenText, {flexDirection: 'row', marginBottom: 40, marginTop: 320}]}
            onPress={() => navigation.navigate('ProgressScreen', { book })}>
            <Image 
                source={require('../../assets/Progress.png')}
                style={styles.icon}
            />
            <Text style={[styles.itemText, {bottom: 1}]}>Прогресс</Text>
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
            onPress={() => navigation.navigate('TimerScreen', { book })}>
            <Image 
                source={require('../../assets/Time.png')}
                style={styles.icon}
            />
            <Text style={[styles.itemText, {top: 1}]}>Таймер</Text>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 20
  },
  itemText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 0,
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
    width: 200,
    height: 40,
    padding: 6,
    paddingBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
    bottom: 2,
    marginLeft: 35
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
  switchContainer: {
    width: 60,
    height: 30,
    borderRadius: 30,
    padding: 2,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: '#4CD964', // зеленый
  },
  switchOff: {
    backgroundColor: '#ccc', // серый
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    elevation: 2,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CACACA',
  },
  selectedDay: {
    backgroundColor: '#B5EAD7',
  }
});

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