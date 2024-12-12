import React from "react";
import { TextInput, Button, View, StyleSheet } from "react-native";

const SearchBar = ({ query, setQuery, onSearch }) => (
  <View style={styles.searchContainer}>
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
  searchContainer: { marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, borderColor: "#ccc", marginBottom: 10 },
});

export default SearchBar;
