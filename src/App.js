import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, TextInput, Button, FlatList, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

const Stack = createStackNavigator();

// 홈 화면: 책 검색
const HomeScreen = ({ navigation }) => {
  const [query, setQuery] = useState(""); // 검색어
  const [books, setBooks] = useState([]); // 검색 결과
  const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지

  const searchBooks = async () => {
    const API_KEY = "ttbseungjun98281846001"; // 알라딘 API 키
    const BASE_URL = "https://www.aladin.co.kr/ttb/api/ItemSearch.aspx";

    try {
      // 책 검색 요청 (현재 페이지 기준)
      const response = await fetch(
        `${BASE_URL}?ttbkey=${API_KEY}&Query=${encodeURIComponent(
          query
        )}&QueryType=Title&MaxResults=10&start=${(currentPage - 1) * 10 + 1}&SearchTarget=Book&Output=JS&Version=20131101`
      );

      if (!response.ok) {
        throw new Error("API 호출 실패");
      }

      const data = await response.json(); // JSON 형태로 응답 처리
      const bookList = data.item || []; // 책 목록 저장

      // 전체 결과 수를 확인하고 페이지 수 계산
      const totalItems = data.totalResults || 0; // 전체 책 수
      const pages = Math.ceil(totalItems / 10); // 페이지 수 계산 (1페이지당 10개 항목)

      setBooks(bookList);
      setTotalPages(pages); // 총 페이지 수 저장
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
    }
  };

  // 이전 페이지로 이동
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      searchBooks(); // 새 페이지 검색
    }
  };

  // 다음 페이지로 이동
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      searchBooks(); // 새 페이지 검색
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="책 제목을 입력하세요"
        value={query}
        onChangeText={setQuery}
      />
      <Button title="검색" onPress={searchBooks} />
      <FlatList
        data={books}
        keyExtractor={(item) => item.itemId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("Details", { book: item })}
          >
            {item.cover ? (
              <Image source={{ uri: item.cover }} style={styles.image} />
            ) : (
              <Text>No Image</Text>
            )}
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.author}</Text>
            <Text>{item.priceStandard}원</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.pagination}>
        <Button title="이전" onPress={prevPage} disabled={currentPage === 1} />
        <Text>{`Page ${currentPage} of ${totalPages}`}</Text>
        <Button title="다음" onPress={nextPage} disabled={currentPage === totalPages} />
      </View>
    </View>
  );
};

// 상세 화면: 책 상세 정보
const DetailsScreen = ({ route }) => {
  const { book } = route.params;

  return (
    <View style={styles.detailsContainer}>
      {book.cover ? (
        <Image source={{ uri: book.cover }} style={styles.detailsImage} />
      ) : (
        <Text>No Image</Text>
      )}
      <Text style={styles.detailsTitle}>{book.title}</Text>
      <Text style={styles.detailsText}>저자: {book.author}</Text>
      <Text style={styles.detailsText}>출판사: {book.publisher}</Text>
      <Text style={styles.detailsText}>출판일: {book.pubDate}</Text>
      <Text style={styles.detailsText}>가격: {book.priceStandard}원</Text>
      <Text style={styles.detailsText}>설명: {book.description}</Text>
    </View>
  );
};

// 메인 App 컴포넌트
const App = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "책 검색" }} />
      <Stack.Screen name="Details" component={DetailsScreen} options={{ title: "책 정보" }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderColor: "#ccc" },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontWeight: "bold" },
  image: { width: 50, height: 75, marginBottom: 10 }, // 책 이미지 크기 설정
  pagination: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  detailsContainer: { padding: 20, backgroundColor: "#fff", flex: 1 },
  detailsImage: { width: 150, height: 225, marginBottom: 10 }, // 상세 페이지에서 책 이미지 크기 설정
  detailsTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  detailsText: { fontSize: 16, marginBottom: 5 },
});
