// src/screens/HomeScreen.js
import React, { useState, useRef } from "react";
import { View, StyleSheet, Keyboard, Text, ActivityIndicator } from "react-native";
import SearchBar from "../components/SearchBar";
import BookList from "../components/BookList";
import { searchBooks } from "../api/aladinApi";

const HomeScreen = ({ navigation }) => {
  const [query, setQuery] = useState(""); // 검색어
  const [books, setBooks] = useState([]); // 책 목록
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const listRef = useRef(null); // FlatList 참조 객체

  // 검색 처리 함수
  const onSearch = async () => {
    Keyboard.dismiss(); // 키보드 닫기
    setIsLoading(true); // 로딩 상태 활성화
    try {
      const results = await searchBooks(query); // 검색 API 호출
      setBooks(results); // 검색 결과 업데이트

      // 검색 결과 상단으로 스크롤
      if (listRef.current && results.length > 0) {
        listRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
    } finally {
      setIsLoading(false); // 로딩 상태 비활성화
    }
  };

  return (
    <View style={styles.container}>
      {/* 검색 바 */}
      <SearchBar query={query} setQuery={setQuery} onSearch={onSearch} />

      {/* 로딩 상태 또는 결과 표시 */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : books.length === 0 ? (
        <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
      ) : (
        <BookList
          ref={listRef} // FlatList 참조 전달
          books={books}
          onSelectBook={(book) => navigation.navigate("Details", { book })} // 선택된 책 디테일 페이지로 전달
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});

export default HomeScreen;
