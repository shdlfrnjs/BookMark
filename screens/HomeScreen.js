import React, { useState } from 'react';
import { View } from 'react-native';
import SearchBar from '../components/SearchBar';
import BookList from '../components/BookList';
import { searchBooks } from '../api/aladinApi';

const HomeScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);

  const onSearch = async () => {
    const results = await searchBooks(query);
    setBooks(results);
  };

  return (
    <View>
      <SearchBar query={query} setQuery={setQuery} onSearch={onSearch} />
      <BookList
        books={books}
        onSelectBook={(book) => navigation.navigate('Details', { book })}
      />
    </View>
  );
};

export default HomeScreen;
