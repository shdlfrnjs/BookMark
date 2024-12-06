import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const SearchBar = ({ query, setQuery, onSearch }) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      placeholder="책 제목을 입력하세요"
      value={query}
      onChangeText={setQuery}
    />
    <Button title="검색" onPress={onSearch} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    margin: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 5,
  },
});

export default SearchBar;
