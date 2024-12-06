// src/screens/HomeScreen.js
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import SearchBar from "../components/SearchBar";
import BookList from "../components/BookList";
import { searchBooks } from "../api/aladinApi";

const HomeScreen = ({ navigation }) => {
  const [query, setQuery] = useState(""); // 검색어
  const [books, setBooks] = useState([]); // 책 목록

  // 검색 처리 함수
  const onSearch = async () => {
    const results = await searchBooks(query);
    setBooks(results); // 검색된 책 목록 업데이트
  };

  return (
    <View style={styles.container}>
      {/* 검색 바 컴포넌트 */}
      <SearchBar query={query} setQuery={setQuery} onSearch={onSearch} />
      {/* 검색된 책 목록 표시 */}
      <BookList
        books={books}
        onSelectBook={(book) => navigation.navigate("Details", { book })} // 선택된 책을 디테일 페이지로 전달
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" }, // 기본 스타일
});

export default HomeScreen;
