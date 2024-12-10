import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import { useFocusEffect } from '@react-navigation/native';

const MyBooksScreen = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyBooks = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const q = query(
          collection(db, "books"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const booksList = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setMyBooks(booksList);
      } catch (error) {
        setError("도서를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchMyBooks();
    }, [])
  );

  if (loading) return <Text style={styles.loadingText}>로딩 중...</Text>;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={myBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const { readPages, pageCount, title, author, publisher } = item;
          const progress = (readPages / pageCount) * 100;

          return (
            <View style={styles.bookItem}>
              {/* 책 표지 이미지 */}
              {item.cover ? (
                <Image source={{ uri: item.cover }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverPlaceholder} />
              )}

              <View style={styles.bookInfoContainer}>
                <Text style={styles.bookTitle} numberOfLines={1}>{title}</Text>

                {/* 저자, 출판사 정보 및 읽은 페이지 / 총 페이지 */}
                <Text style={styles.bookDetails}>저자: {author}</Text>
                <Text style={styles.bookDetails}>출판사: {publisher}</Text>
                <Text style={styles.readingProgress}>읽은 페이지: {item.readPages} / {item.pageCount}</Text>

                {/* 진행률 바 */}
                <View style={styles.progressRow}>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(progress, 90)}%` }]} />
                  </View>

                  {/* 퍼센트 텍스트가 진행률바 끝 오른쪽에 배치 */}
                  <Text style={styles.progressText}>{`${progress.toFixed(1)}%`}</Text>
                </View>

              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9"
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20
  },
  bookItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#ccc"
  },
  coverImage: {
    width: 60,
    height: 90,
    resizeMode: "cover",
    borderRadius: 8,
    marginRight: 12
  },
  coverPlaceholder: {
    width: 60,
    height: 90,
    backgroundColor: "#ddd",
    borderRadius: 8,
    marginRight: 12
  },
  bookInfoContainer: {
    flex: 1,
    justifyContent: 'space-between'
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333"
  },
  bookDetails: {
    fontSize: 16,
    color: "#666",
    marginTop: 2
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  progressBarBackground: {
    height: 18,
    marginTop: 5,
    width: "85%",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 10
  },
  progressText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 14
  },
  readingProgress: {
    fontSize: 14,
    marginTop: 4
  },
});

export default MyBooksScreen;
