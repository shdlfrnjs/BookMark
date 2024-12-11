import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Modal, TextInput, TouchableOpacity } from "react-native";
import { getDocs, collection, query, where, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";

const MyBooksScreen = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviewText, setReviewText] = useState("");

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
        const booksList = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setMyBooks(booksList);
      } catch (error) {
        setError("도서를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveReview = async () => {
    if (!reviewText.trim()) {
      alert("독후감을 입력해주세요.");
      return;
    }

    try {
      await addDoc(collection(db, "bookReport"), {
        bookId: selectedBook.id,
        review: reviewText,
        userId: getAuth().currentUser.uid,
        createdAt: new Date(),
      });
      alert("독후감이 저장되었습니다.");
      setReviewText("");
      setModalVisible(false);
    } catch (error) {
      alert("독후감을 저장하는 데 실패했습니다.");
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
              {item.cover ? (
                <Image source={{ uri: item.cover }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverPlaceholder} />
              )}

              <View style={styles.bookInfoContainer}>
                <Text style={styles.bookTitle} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.bookDetails}>저자: {author}</Text>
                <Text style={styles.bookDetails}>출판사: {publisher}</Text>
                <Text style={styles.readingProgress}>
                  읽은 페이지: {item.readPages || 0} / {item.pageCount}
                </Text>

                <View style={styles.progressRow}>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${item.readPages && item.pageCount ? (Math.min((item.readPages / item.pageCount) * 100, 100)) : 0}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{`${(item.readPages && item.pageCount ? Math.min((item.readPages / item.pageCount) * 100, 100) : 0).toFixed(1)}%`}</Text>
                </View>

                {progress >= 100 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedBook(item);
                      setModalVisible(true);
                    }}
                    style={styles.reviewButton}
                  >
                    <Text style={styles.reviewButtonText}>독후감 작성</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* 독후감 작성 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>독후감 작성</Text>
            <TextInput
              style={styles.textInput}
              placeholder="독후감을 입력하세요"
              value={reviewText}
              onChangeText={setReviewText}
              multiline
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveReview}
                style={styles.saveButton}
              >
                <Text style={styles.buttonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  bookItem: {
    flexDirection: "row",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#ccc",
  },
  coverImage: {
    width: 60,
    height: 90,
    resizeMode: "cover",
    borderRadius: 8,
    marginRight: 12,
  },
  coverPlaceholder: {
    width: 60,
    height: 90,
    backgroundColor: "#ddd",
    borderRadius: 8,
    marginRight: 12,
  },
  bookInfoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  bookDetails: {
    fontSize: 16,
    color: "#666",
    marginTop: 2,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBarBackground: {
    height: 18,
    marginTop: 5,
    width: "83%",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 10,
  },
  progressText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 14,
    marginRight: 8,
    textAlign: "right",
  },
  readingProgress: {
    fontSize: 14,
    marginTop: 4,
  },
  reviewButton: {
    marginTop: 8,
    width: "95%",
    backgroundColor: "#0099fa",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  reviewButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  textInput: {
    width: "100%",
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ff0000",
    paddingVertical: 10,
    marginRight: 5,
    borderRadius: 4,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#0099fa",
    paddingVertical: 10,
    marginLeft: 5,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default MyBooksScreen;