import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Firebase Firestore 설정 파일에서 db 임포트
import { getAuth } from "firebase/auth";
import { useFocusEffect } from '@react-navigation/native'; // useFocusEffect 임포트

const MyBooksScreen = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 조회 함수
  const fetchMyBooks = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      try {
        const q = query(
          collection(db, "books"), // 'books' 컬렉션을 조회
          where("userId", "==", user.uid) // 사용자 uid를 기준으로 필터링
        );
        const querySnapshot = await getDocs(q);
        const booksList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setMyBooks(booksList);
      } catch (error) {
        setError("도서를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  // 화면이 포커스를 받을 때마다 데이터를 새로 불러오기
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchMyBooks();
    }, [])
  );

  if (loading) {
    return <Text>로딩 중...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={myBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookItem}>
            {/* 책 표지 이미지 추가 */}
            {item.cover ? (
              <Image source={{ uri: item.cover }} style={styles.coverImage} />
            ) : (
              <Text>이미지 없음</Text>
            )}
            <View style={styles.bookInfoContainer}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text>저자: {item.author}</Text>
              <Text>출판사: {item.publisher}</Text>
              <Text>ISBN: {item.isbn13}</Text>
              <Text>총 페이지 수: {item.pageCount}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  bookItem: { marginBottom: 20, flexDirection: 'row', alignItems: 'flex-start' }, // 책 항목을 수평 배치
  bookInfoContainer: { marginLeft: 10 }, // 책 정보가 표지 이미지 옆에 배치되도록 여백 추가
  bookTitle: { fontSize: 18, fontWeight: "bold" },
  coverImage: { width: 50, height: 75, resizeMode: 'contain' }, // 작은 표지 이미지 크기
});

export default MyBooksScreen;
