import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { auth, db } from '../../firebase-config';

export default function CollectionSearchScreen({ route, navigation }) {
  const { collectionType } = route.params;
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadBooks = async () => {
        try {
          setLoading(true);
          const user = auth.currentUser;
          if (!user) return;

          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            let userBooks = docSnap.data().books || [];

            switch(collectionType) {
              case 'Все книги': break;
              case 'Читаю сейчас':
                userBooks = userBooks.filter(b => b.status === 'Читаю сейчас');
                break;
              case 'Планирую':
                userBooks = userBooks.filter(b => b.status === 'Планирую');
                break;
              case 'Прочитано':
                userBooks = userBooks.filter(b => b.status === 'Прочитано');
                break;
              case 'Прочитанные в этом году':
                const currentYear = new Date().getFullYear();
                userBooks = userBooks.filter(b => 
                  b.status === 'Прочитано' && 
                  new Date(b.addedAt).getFullYear() === currentYear
                );
                break;
            }

            setBooks(userBooks);
            setFilteredBooks(userBooks);
          }
        } catch (error) {
          console.error('Ошибка загрузки:', error);
        } finally {
          setLoading(false);
        }
      };

      loadBooks();
    }, [collectionType])
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const query = searchQuery.toLowerCase();
      const results = books.filter(book => {
        const titleMatch = book.title?.toLowerCase().includes(query);
        const authorsMatch = book.authors?.toLowerCase().includes(query);
        return titleMatch || authorsMatch;
      });
      setFilteredBooks(results);
    }
  }, [searchQuery, books]);

  const renderBook = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookCard}
      onPress={() => navigation.navigate('BookDetailScreen', { book: item })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={item.thumbnail ? 
            { uri: item.thumbnail } : 
            require('../../assets/BookDark.png')}
          style={styles.bookImage}
        />
      </View>
      <Text style={styles.bookTitle} numberOfLines={1}>
        {item.title || 'Без названия'}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {item.authors || 'Автор неизвестен'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity 
          style={{marginTop: 50, marginLeft: 10}} 
          onPress={() => navigation.goBack()}
        >
          <Image source={require('../../assets/Vector.png')} />
        </TouchableOpacity>
        <Text style={[styles.mainTitle, {marginLeft: 90}]}>
          {collectionType.length > 15 ? 
            `${collectionType.substring(0, 15)}...` : 
            collectionType}
        </Text>
      </View>

      <View style={styles.greenText}>
        <View style={{flexDirection: 'row'}}>
          <Image 
            source={require('../../assets/lupa.png')}
            style={[styles.searchIcon, {bottom: 6, left: -5}]}
          />
          <TextInput
            placeholder="Введите название/автора..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, {bottom: 4, left: -10}]}
          />
        </View>
      </View>

      {filteredBooks.length === 0 ? (
        <Text style={styles.emptyText}>
          {searchQuery ? 'Ничего не найдено' : 'Коллекция пуста'}
        </Text>
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={renderBook}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8EDEB',
  },
  mainTitle: {
    fontSize: 28,
    marginTop: 45,
    fontWeight: 'bold',
  },
  greenText: {
    backgroundColor: '#B5EAD7',
    borderRadius: 25,
    padding: 6,
    marginTop: 20,
    height: 40,
  },
  searchIcon: {
    width: 30,
    height: 30,
    marginLeft: 14,
    marginTop: 5,
    resizeMode: 'contain'
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8EDEB',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  flatListContainer: {
    paddingBottom: 160,
    paddingTop: 20,
  },
  bookCard: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
    maxWidth: '30%',
  },
  imageContainer: {
    width: 110,
    height: 140,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  bookAuthor: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});