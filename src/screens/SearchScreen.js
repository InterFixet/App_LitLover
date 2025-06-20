import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';

const API_KEY = 'AIzaSyDdgaPlRUBnL-EB7KwlJedxDvWefATEFTo'; // Вставьте сюда ваш API-ключ

export default function BookSearchScreen({ navigation }) {
  const [query, setQuery] = useState(''); // Что вводит пользователь
  const [books, setBooks] = useState([]); // Найденные книги

  // Поиск книг
  const searchBooks = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}&key=${API_KEY}&maxResults=18`
        );

      const filteredBooks = (response.data.items || [])
      .filter(book => book.volumeInfo?.title) // Отфильтровываем книги без названия
      .filter((book, index, self) =>
        index === self.findIndex(b => b.id === book.id)
      );

      setBooks(filteredBooks);
    } catch (error) {
      console.log('Ошибка:', error);
    }
  };

  // Отображение книги в списке
  const renderBook = ({ item }) => {
    const hasCover = item.volumeInfo.imageLinks?.thumbnail;

    return (
        <TouchableOpacity
        style={styles.bookCard}
        onPress={() => navigation.navigate('AddBookScreen', { book: item.volumeInfo })}>
            <View style={styles.imageContainer}>
                <Image
                    source={
                        hasCover
                        ? { uri: item.volumeInfo.imageLinks.thumbnail }
                        : require('../../assets/BookDark.png') // картинка-заглушка
                    }
                    style={styles.bookImage}
                    resizeMode="contain"
                    />
            </View>
            <Text style={styles.bookTitle} numberOfLines={1}>
                {item.volumeInfo.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
                {item.volumeInfo.authors?.join(', ') || 'Автор неизвестен'}
            </Text>
        </TouchableOpacity>
  )};

  return (
    <View style={styles.container}>
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity 
                style={{marginTop: 50, marginLeft: 10}} 
                onPress={() => navigation.goBack()}>
                <Image 
                    source={require('../../assets/Vector.png')}
                ></Image>
            </TouchableOpacity>
            <Text style={[styles.mainTitle, {marginLeft: 90}]}>Поиск книги</Text>
        </View>
        <View style={[styles.greenText, { padding: 0 , marginTop: 0}]}>
            <View style={{flexDirection: 'row'}}>
                <Image 
                        source={require('../../assets/lupa.png')} // укажите правильный путь к иконке
                        style={{ 
                          width: 30, // размер иконки
                          height: 30,
                          marginLeft: 14,
                          marginTop: 5,
                          resizeMode: 'contain'
                        }}
                      />
                <TextInput
                    placeholder="Название книги или автор"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={searchBooks}
                    style = {{marginLeft: 10}}
                />
            </View>
        </View>
        <View>
            <FlatList
                style={{marginTop: 40}}
                data={books}
                renderItem={renderBook}
                keyExtractor={(item) => item.id}
                numColumns={3} // 3 книги в строке
                contentContainerStyle={styles.flatListContainer}
                
            />
        </View>
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
    marginLeft: 115,
    marginTop: 45,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  greenText: {
    backgroundColor: '#B5EAD7',
    borderRadius: 25,
    padding: 6,
    height: 'auto', // или minHeight: 50
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
  flatListContainer: {
    paddingBottom: 160,
    paddingTop: 10
  },
  bookCard: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
    maxWidth: '30%', // Чтобы влезало 3 книги
  },
  bookImage: {
    width: 110,
    height: 140,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  imageContainer: {
    width: 110,
    height: 140,
    borderRadius: 4, // Если хотите скругленные углы
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 8.84,
    elevation: 10, // Для Android
    marginBottom: 8,
  },
  booksList: {
    flex: 1,
    width: '100%',
  },
});