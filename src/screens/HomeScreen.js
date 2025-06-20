import React from 'react';
import { Image } from 'react-native';
import { useState, useEffect } from 'react';
import { ScrollView, View,  ActivityIndicator, Text, StatusBar,TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth, db } from '../../firebase-config';
import { updateProfile, onAuthStateChanged } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker'
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const BACKEND_URL = 'http://10.0.2.2:3000';

// Экран Мои книги
function FeedScreen() {
  const navigation = useNavigation();
  const [activeCollection, setActiveCollection] = useState('Все книги');
  const [books, setBooks] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    reading: 0,
    planned: 0,
    finished: 0,
    yearly: 0
  });

  // Добавляем фокус-эффект
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadBooks();
    });
    return unsubscribe;
  }, [navigation]);
  
    // Выносим загрузку в отдельную функцию
  const loadBooks = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userBooks = docSnap.data().books || [];
        setBooks(userBooks);
        
        const currentYear = new Date().getFullYear();
        const newCounts = {
          all: userBooks.length,
          reading: userBooks.filter(b => b.status === 'Читаю сейчас').length,
          planned: userBooks.filter(b => b.status === 'Планирую').length,
          finished: userBooks.filter(b => b.status === 'Прочитано').length,
          yearly: userBooks.filter(b => 
            b.status === 'Прочитано' && 
            new Date(b.addedAt).getFullYear() === currentYear
          ).length
        };
        
        console.log('Обновляю счётчики:', newCounts); // Для отладки
        setCounts(newCounts);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  };

  // Первоначальная загрузка
  useEffect(() => {
    loadBooks();
  }, []);

    const renderBookSquares = (collectionType) => {
    let filteredBooks = [];
    
    switch(collectionType) {
      case 'Все книги':
        filteredBooks = books;
        break;
      case 'Читаю сейчас':
        filteredBooks = books.filter(b => b.status === 'Читаю сейчас');
        break;
      case 'Планирую':
        filteredBooks = books.filter(b => b.status === 'Планирую');
        break;
      case 'Прочитано':
        filteredBooks = books.filter(b => b.status === 'Прочитано');
        break;
      case 'Прочитанные в этом году':
        const currentYear = new Date().getFullYear();
        filteredBooks = books.filter(b => 
          b.status === 'Прочитано' && 
          new Date(b.addedAt).getFullYear() === currentYear
        );
        break;
    }

    useEffect(() => {
      if (navigation.getState().routes.some(r => r.params?.refresh)) {
        loadBooks();
      }
    }, [navigation.getState()]);

    // Берем первые 3 книги
    const booksToShow = filteredBooks.slice(0, 3);

    return (
      <>
        {booksToShow.map((book, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.BookSquare}
            onPress={() => navigation.navigate('BookDetailScreen', { book })}
          >
            {book.thumbnail ? (
              <Image 
                source={{ uri: book.thumbnail }} 
                style={{ width: '100%', height: '100%', borderRadius: 10 }}
              />
            ) : (
              <Image
                source={require('../../assets/BookDark.png')}
                style={{ width: 100, height: 100, borderRadius: 10, top:30, left:2 }}
              />
            )}
          </TouchableOpacity>
        ))}
        
        {/* Добавляем плюсы, если книг меньше 3 */}
        {Array.from({ length: 3 - booksToShow.length }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.BookSquare}>
            <Image
              source={require('../../assets/Plus.png')}
              style={{ width: 40, height: 40, alignSelf: 'center', top: 60 }}
            />
          </View>
        ))}
      </>
    );
  };


    return (
    <View style={styles.container}>
      <Text style={[styles.mainTitle, {marginLeft: 140}]}>Мои книги</Text>
      <Text style={[styles.screenTitle, {fontSize: 28, marginBottom: 40}]}>
        {activeCollection === 'Прочитанные в этом году' ? 'Прочитанные\nв этом году' : activeCollection}
      </Text>
      
      {/* Кнопка поиска по коллекции */}
      <TouchableOpacity 
        style={[styles.greenText, { flexDirection: 'row', width: 210, height: 40, marginLeft: 220, position: 'absolute', top: 125}]}
        onPress={() => navigation.navigate('CollectionSearchScreen', { collectionType: activeCollection })}
      >
        <Image
          source={require('../../assets/lupa.png')}
          style={[styles.image, { position: 'absolute', left: -78, top: 5}]}  
        />
        <Text style={[styles.itemText, {fontWeight: 600, position: 'absolute', left: 40, top: 8}]}>
          Поиск по коллекции
        </Text>
      </TouchableOpacity>
      
      {/* Прямоугольники с книгами */}
      <View style={{flexDirection: 'row'}}>
        {renderBookSquares(activeCollection)}
      </View>

      {/* Кнопка добавления книги */}
      <TouchableOpacity 
        style={[styles.greenText, { flexDirection: 'row', width: 320, paddingLeft: 15, marginTop: 40, alignItems: 'center' }]}
        onPress={() => navigation.navigate('SearchScreen')}
      >
        <Image 
          source={require('../../assets/lupa.png')}
          style={{ width: 30, height: 30, marginRight: 8, resizeMode: 'contain' }}
        />
        <Text style={[styles.itemText, { fontSize: 22, fontWeight: 500 }]}>
          Добавить книгу
        </Text>
      </TouchableOpacity>

      {/* Список коллекций */}
      <View style={{paddingHorizontal: 10}}>
        <Text style={[styles.screenTitle, {fontSize: 28, marginTop: 40}]}>Коллекция</Text>
        
        {/* Все книги */}
        <View style={{marginBottom: -20}}>
          <TouchableOpacity onPress={() => setActiveCollection('Все книги')}>
            <Text style={[styles.screenTitle2, {fontSize: 24}]}>Все книги</Text>
          </TouchableOpacity>        
          <Text style={[styles.screenTitle2, {fontSize: 24, alignSelf: 'flex-end', top: -35}]}>
            {counts.all}
          </Text>
          <View style={{ height: 2, backgroundColor: 'black', marginTop: -28}} />
        </View>

        {/* Сейчас читаю */}
        <View style = {{marginTop: 28}}>
          <TouchableOpacity onPress={() => setActiveCollection('Читаю сейчас')}>
            <Text style={[styles.screenTitle2, {fontSize: 24}]}>Сейчас читаю</Text>
          </TouchableOpacity>
          <Text style={[styles.screenTitle2, {fontSize: 24, alignSelf: 'flex-end', top: -35}]}>{counts.reading}</Text>
          <View style={{ height: 2, backgroundColor: 'black', marginTop: -28}} />
        </View>

        {/* Сейчас читаю */}
        <View style = {{marginTop: 8}}>
          <TouchableOpacity onPress={() => setActiveCollection('Планирую')}>
            <Text style={[styles.screenTitle2, {fontSize: 24}]}>Планирую прочитать</Text>
          </TouchableOpacity>
          <Text style={[styles.screenTitle2, {fontSize: 24, alignSelf: 'flex-end', top: -35}]}>{counts.planned}</Text>
          <View style={{ height: 2, backgroundColor: 'black', marginTop: -28}} />
        </View>

        {/* Прочитано */}
        <View style = {{marginTop: 8}}>
          <TouchableOpacity onPress={() => setActiveCollection('Прочитано')}>
            <Text style={[styles.screenTitle2, {fontSize: 24}]}>Прочитано</Text>
          </TouchableOpacity>
          <Text style={[styles.screenTitle2, {fontSize: 24, alignSelf: 'flex-end', top: -35}]}>{counts.finished}</Text>
          <View style={{ height: 2, backgroundColor: 'black', marginTop: -28}} />
        </View>

        {/* Прочитанные в этом году */}
        <View style = {{marginTop: 8}}>
          <TouchableOpacity onPress={() => setActiveCollection('Прочитанные в этом году')}>
            <Text style={[styles.screenTitle2, {fontSize: 24}]}>Прочитанные в этом году</Text>
          </TouchableOpacity>
          <Text style={[styles.screenTitle2, {fontSize: 24, alignSelf: 'flex-end', top: -35}]}>{counts.yearly}</Text>
          <View style={{ height: 2, backgroundColor: 'black', marginTop: -28}} />
        </View>
      </View>
      <TouchableOpacity style={[styles.greenText, { flexDirection: 'row', width: 300, paddingLeft: 25, marginLeft: 50, marginTop: 30, alignItems: 'center' }]}
        onPress={() => navigation.navigate('Search')} // Открывает экран поиска
      >
          <Image 
            source={require('../../assets/note.png')} // укажите правильный путь к иконке
            style={{ 
              width: 30, // размер иконки
              height: 30,
              marginRight: 8, // отступ между иконкой и текстом
              resizeMode: 'contain'
            }}
          />
          <Text style={[styles.itemText, { fontWeight: 500, fontSize: 22}]}>Музыка для чтения</Text>
      </TouchableOpacity>
    </View>
  );
}

// Экран Статистика
function MessagesScreen({ navigation }) {
  const rows = 6, columns = 7, totalCells = rows * columns;
  const [readDates, setReadDates] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const currentMonth = today.getMonth(); // 0 - Jan
  const currentYear = today.getFullYear();
  const monthName = today.toLocaleString('ru-RU', { month: 'long' });
  const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDayIndex = firstDayOfMonth.getDay(); // 0 (Sun) — 6 (Sat)
  const shift = startDayIndex === 0 ? 6 : startDayIndex - 1;
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPreviousMonth = new Date(currentYear, currentMonth, 0).getDate();

  const formatDateToISO = (year, month, day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const readDateSet = new Set(readDates);

  const daysArray = [];

  // Добавляем дни предыдущего месяца
  for (let i = shift - 1; i >= 0; i--) {
    const day = daysInPreviousMonth - i;
    const dateStr = formatDateToISO(currentYear, currentMonth - 1, day);
    daysArray.push({
      day,
      current: false,
      read: readDateSet.has(dateStr)
    });
  }

  // Добавляем дни текущего месяца
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const dateStr = formatDateToISO(currentYear, currentMonth, i);
    daysArray.push({
      day: i,
      current: true,
      read: readDateSet.has(dateStr)
    });
  }

  // Добавляем дни следующего месяца
  const nextDaysCount = totalCells - daysArray.length;
  for (let i = 1; i <= nextDaysCount; i++) {
    const dateStr = formatDateToISO(currentYear, currentMonth + 1, i);
    daysArray.push({
      day: i,
      current: false,
      read: readDateSet.has(dateStr)
    });
  }

  // YYYY-MM (например: "2025-06")
const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

// Количество прочитанных дней в текущем месяце
const daysReadThisMonth = readDates.filter(date => date.startsWith(currentMonthPrefix)).length;

  const renderGrid = () => {
    const grid = [];

    for (let row = 0; row < rows; row++) {
      const rowItems = [];

      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        const item = daysArray[index];
        const bgColor = item.read
          ? '#B5EAD7'
          : item.current
            ? '#CACACA'
            : '#E0E0E0';

        rowItems.push(
          <View
            key={`${row}-${col}`}
            style={{
              width: 28,
              height: 28,
              backgroundColor: bgColor,
              marginRight: 10,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 4
            }}
          >
            <Text style={{ fontSize: 12 }}>{item.day}</Text>
          </View>
        );
      }

      grid.push(
        <View key={row} style={{ flexDirection: 'row', marginBottom: 10 }}>
          {rowItems}
        </View>
      );
    }

    return grid;
  };

  useEffect(() => {
    const fetchReadDates = async () => {
      try {
        const user = auth.currentUser;
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        const books = snap.data()?.books || [];

        const allReadDates = books.flatMap(book => book.readDates || []);
        setReadDates(allReadDates);
      } catch (e) {
        console.error('Ошибка загрузки дат чтения:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchReadDates();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.mainTitle, { marginLeft: 135 }]}>Статистика</Text>
      <Text style={[styles.mainTitle, { marginLeft: 10, marginTop: 10 }]}>Календарь</Text>
      <View style={{ flexDirection: 'row' }}>
        <Text style={[styles.mainTitle, { marginLeft: 10, marginTop: 0, fontWeight: '400' }]}>{capitalizedMonthName}</Text>
        <TouchableOpacity
          style={{ marginTop: 8, marginLeft: 15 }}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../../assets/Vector.png')}
            style={{ transform: [{ scaleX: -1 }] }}
          />
        </TouchableOpacity>
      </View>

      {renderGrid()}

      <View style={{ flexDirection: 'row' }}>
        <AnimatedCircularProgress
          size={130}
          width={12}
          fill={(daysReadThisMonth / daysInCurrentMonth) * 100}
          tintColor="#FF85A2"
          backgroundColor="#FADADD"
          rotation={0}
          style={{ marginTop: 20, left: 280, bottom: 200 }}
        >
          {() => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{daysReadThisMonth}</Text>
              <Text style={{ fontSize: 18 }}>дней</Text>
              <Text style={{ fontSize: 18 }}>из {daysInCurrentMonth}</Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>
    </View>
  );
}

// Экран Достижения
function ClipsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Достижения</Text>
      <Text style={[styles.sectionTitle2, { fontWeight: 300 }]}>По количеству прочитанных книг Вы достигли уровня:</Text>
      <View style={styles.achivCurcle}></View>
      <Text style={[styles.sectionTitle2, { fontWeight: 300, marginTop: 20 }]}>Читайте книги и получайте новые звания!</Text>
      <View style={styles.greenContainer}>
        <View style={[styles.greenText, { width: 200, paddingLeft: 30 }]}>
          <Text style={[styles.itemText, { fontWeight: 500 }]}>Прочитано: 0 книг</Text>
        </View>
        <View style={[styles.greenText, { width: 300, marginTop: 10, paddingLeft: 30 }]}>
          <Text style={[styles.itemText, { fontWeight: 500 }]}>До следующего уровня: 25 книг</Text>
        </View>
      </View>
      <Text style={[styles.sectionTitle2, { fontWeight: 300, marginTop: 120, marginLeft: 50 }]}>Ваши последние достижения:</Text>
      <View>

        {/* Первая строка - достижение 1 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -20, paddingHorizontal: 20 }}>
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.itemText, { fontWeight: '600' }]}>Первое достижение</Text>
            <Text style={styles.itemText}>Прочитать 1 книгу</Text>
          </View>
          <View style={[styles.achivSquare, { marginLeft: 160, marginBottom: 20 }]}>
            <Image
              source={require('../../assets/AchivPink.png')}
              style={styles.image}
            />
          </View>
        </View>

        {/* Вторая строка - достижение 2 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -20, paddingHorizontal: 20 }}>
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.itemText, { fontWeight: '600' }]}>Второе достижение</Text>
            <Text style={styles.itemText}>Прочитать 2 книгу</Text>
          </View>
          <View style={[styles.achivSquare, { marginLeft: 160, marginBottom: 20 }]}>
            <Image
              source={require('../../assets/AchivPink.png')}
              style={styles.image}
            />
          </View>
        </View>

        {/* Третья строка - достижение 3 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -20, paddingHorizontal: 20 }}>
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.itemText, { fontWeight: '600' }]}>Третье достижение</Text>
            <Text style={styles.itemText}>Прочитать 3 книгу</Text>
          </View>
          <View style={[styles.achivSquare, { marginLeft: 160, marginBottom: 20 }]}>
            <Image
              source={require('../../assets/AchivPink.png')}
              style={styles.image}
            />
          </View>
        </View>
      </View>

      <View style={[styles.greenText, { flexDirection: 'row', width: 200, paddingLeft: 15, marginLeft: 100, marginTop: 10, alignItems: 'center' }]}>
          <Image 
            source={require('../../assets/AchivGrey.png')} // укажите правильный путь к иконке
            style={{ 
              width: 30, // размер иконки
              height: 30,
              marginRight: 8, // отступ между иконкой и текстом
              resizeMode: 'contain'
            }}
          />
          <Text style={[styles.itemText, { fontWeight: 500 }]}>Все достижения</Text>
      </View>
    </View>
  );
}

function ProfileScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [userEmail, setUserEmail] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: 'Книжка',
    lastName: 'Страницева',
    about: '',
    gender: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const emailFromMain = user.email;
        const emailFromProvider = user.providerData?.[0]?.email;
        setUserEmail(emailFromMain || emailFromProvider || null);
        setAvatar(user.photoURL);

        const profileData = await loadProfileData(user.uid);
        if (profileData) {
          setProfileData(profileData);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadProfileData = async (userId) => {
    console.log('[КЛИЕНТ] Загружаем профиль для userId:', userId);
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/${userId}`);
      console.log('[КЛИЕНТ] Ответ сервера:', response.status);
      
      if (!response.ok) {
        console.warn('[КЛИЕНТ] Ошибка загрузки профиля');
        throw new Error('Ошибка загрузки');
      }
      
      const data = await response.json();
      console.log('[КЛИЕНТ] Полученные данные:', data);
      return data;
    } catch (error) {
      console.error('[КЛИЕНТ] Ошибка:', error);
      return { firstName: '', lastName: '', about: '', gender: '' };
    }
  };

  const saveProfileData = async (userId, data) => {
    console.log('[КЛИЕНТ] Отправляем данные на сервер:', {
      userId,
      data
    });
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      console.log('[КЛИЕНТ] Ответ сервера:', {
        status: response.status,
        ok: response.ok
      });

      return response.ok;
    } catch (error) {
      console.error('[КЛИЕНТ] Ошибка при сохранении:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('AuthScreen');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
      console.error(error);
    }
  };

  const handleSaveProfile = async () => {
    console.log('[КЛИЕНТ] Нажата кнопка сохранения');
    console.log('Текущие данные:', profileData);
    if (!user) {
      console.warn('Пользователь не авторизован!');
      return;
    }

    const success = await saveProfileData(user.uid, profileData);
    if (success) {
      setIsEditing(false);
      Alert.alert('Успех', 'Профиль успешно обновлен');
    } else {
      Alert.alert('Ошибка', 'Не удалось сохранить профиль');
    }
  };

  const renderEditForm = () => (
    <View style={styles.editForm}>
      <TextInput
        style={styles.input}
        value={profileData.firstName}
        onChangeText={(text) => setProfileData({...profileData, firstName: text})}
        placeholder="Имя"
      />
      <TextInput
        style={styles.input}
        value={profileData.lastName}
        onChangeText={(text) => setProfileData({...profileData, lastName: text})}
        placeholder="Фамилия"
      />
      <TextInput
        style={[styles.input, {height: 80}]}
        multiline
        value={profileData.about}
        onChangeText={(text) => setProfileData({...profileData, about: text})}
        placeholder="О себе"
      />
      
      <View style={styles.genderContainer}>
        <Text style={styles.genderLabel}>Пол:</Text>
        <Picker
          selectedValue={profileData.gender}
          style={styles.picker}
          onValueChange={(itemValue) => setProfileData({...profileData, gender: itemValue})}>
          <Picker.Item label="Не указан" value="" />
          <Picker.Item label="Мужской" value="male" />
          <Picker.Item label="Женский" value="female" />
        </Picker>
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Сохранить</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => setIsEditing(false)}>
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileInfo = () => (
    <>
      <Text style={styles.sectionTitle}>
        {profileData.firstName} {profileData.lastName}
      </Text>
      {userEmail && <Text style={styles.profileEmail}>{userEmail}</Text>}
      {profileData.about && <Text style={styles.aboutText}>{profileData.about}</Text>}
      {profileData.gender && (
        <Text style={styles.genderText}>
          Пол: {profileData.gender === 'male' ? 'Мужской' : 'Женский'}
        </Text>
      )}
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Мой профиль</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={{ fontSize: 40, color: '#333', alignSelf: 'center' }}>
                {profileData.firstName ? profileData.firstName[0].toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          {isEditing ? renderEditForm() : renderProfileInfo()}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Аккаунт</Text>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.itemText}>E-mail</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.itemText}>Пароль</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.sectionItem}
          onPress={() => setIsEditing(true)}>
          <Text style={styles.itemText}>Редактировать профиль</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.itemText}>Изменить аватар</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Настройки</Text>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.itemText}>Уведомления</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.itemText}>Язык</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Обратная связь и поддержка</Text>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.itemText}>Помощь и поддержка</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.itemText}>Оценить приложение</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.itemText}>Связаться</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.itemText}>Условия и положения</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.itemText}>Политика конфиденциальности</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton}>
          <Text style={styles.bottomButtonText}>Сменить аккаунт</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton} onPress={handleLogout}>
          <Text style={styles.bottomButtonText}>Выйти из аккаунта</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.bottomButton, styles.deleteButton]}>
          <Text style={[styles.bottomButtonText, { color: 'red' }]}>Удалить аккаунт</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8EDEB' }}>
      <StatusBar barStyle="dark-content" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconSource;
            let iconSize = size;

            if (route.name === 'Мои книги') {
              iconSource = focused ? require('../../assets/BookLight.png') : require('../../assets/BookDark.png');
              iconSize = 50;
            } else if (route.name === 'Статистика') {
              iconSource = focused ? require('../../assets/StatistikaLight.png') : require('../../assets/StatistikaDark.png');
              iconSize = 30;
            } else if (route.name === 'Мой профиль') {
              iconSource = focused ? require('../../assets/ProfiLight.png') : require('../../assets/ProfiLight.png');
              iconSize = 32;
            } else if (route.name === 'Достижения') {
              iconSource = focused ? require('../../assets/AchivLight.png') : require('../../assets/AchivDark.png');
              iconSize = 46;
            }

            return (
              <Image
                source={iconSource}
                style={{
                  width: iconSize,
                  height: iconSize,
                  tintColor: color,
                  resizeMode: 'contain',
                  marginHorizontal: 0,
                }}
              />
            );
          },
          tabBarLabelStyle: {
            marginBottom: 8, // текст ниже
          },
          tabBarIconStyle: {
            marginTop: 10,    // иконка ниже
          },
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: 'grey',
          tabBarStyle: {
            height: 90,
            width: 350,
            marginLeft: 40,
            backgroundColor: '#F8EDEB',
            borderTopColor: '#000',
            borderTopWidth: 4,
            elevation: 0,
            // shadowOpacity: 0,
            // shadowRadius: 5,
            // shadowOffset: { width: 0, height: -3 },
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Мои книги" component={FeedScreen} />
        <Tab.Screen name="Статистика" component={MessagesScreen} />
        <Tab.Screen name="Достижения" component={ClipsScreen} />
        <Tab.Screen name="Мой профиль" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8EDEB',
  },
  section: {
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  sectionItem: {
    paddingVertical: 5,
    borderBottomWidth: 0,
    borderBottomColor: '#ddd',
  },
  greenContainer: {
    position: 'absolute',
    left: -10,
    top: 490, // Лучше использовать относительное позиционирование
    width: 300,
  },
  //Текст -\/-
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
  sectionTitle2: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  greenText: {
    backgroundColor: '#B5EAD7',
    borderRadius: 25,
    padding: 6,
    height: 'auto', // или minHeight: 50
  },
  itemText: {
    fontSize: 16,
    color: '#000000',
  },
  //Текст -/\-
  bottomButtons: {
    marginTop: 16,
  },
  bottomButton: {
    paddingVertical: 5,
    borderTopColor: '#ddd',
  },
  bottomButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  deleteButton: {
    borderTopWidth: 0,
    borderTopColor: '#ddd',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8EDEB',
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: '#F5F3EF',
    borderRadius: 25,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFDEE6', // Серый фон как placeholder для аватара
    borderWidth: 2,
    borderColor: '#333333',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  achivCurcle: {
    backgroundColor: '#FFDEE6',
    width: 180,
    height: 180,
    borderRadius: 100,
    marginLeft: 120,
    marginTop: 20,
    borderWidth: 3,
    borderColor: '#FFD1DC',
    overflow: 'hidden'
  },
  achivSquare: {
    backgroundColor: '#FFDEE6',
    width: 50,
    height: 50,
    marginLeft: 320,
    marginTop: 25,
    borderWidth: 3,
    borderColor: '#FFD1DC',
  },
  BookSquare: {
    backgroundColor: '#FFDEE6',
    width: 110,
    height: 180,
    marginLeft: 20,
    borderWidth: 3,
    borderColor: '#FFD1DC',
  },
  editForm: {
    padding: 15,
    width: '100%'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  genderLabel: {
    marginRight: 10,
    fontSize: 16
  },
  picker: {
    flex: 1,
    height: 50
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  saveButton: {
    backgroundColor: '#B5EAD7',
    padding: 12,
    borderRadius: 20,
    flex: 1,
    marginRight: 10
  },
  saveButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  cancelButton: {
    backgroundColor: '#FFD1DC',
    padding: 12,
    borderRadius: 20,
    flex: 1
  },
  cancelButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});