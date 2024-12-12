import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";
import { useFocusEffect } from "@react-navigation/native";

const ReadingScheduleScreen = () => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [pagesRead, setPagesRead] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [review, setReview] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [readingLogs, setReadingLogs] = useState([]);
  const [bookDetails, setBookDetails] = useState([]);

  // Fetch user's book list
  const fetchMyBooks = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const booksQuery = query(
        collection(db, "books"),
        where("userId", "==", user.uid) // 사용자의 도서만 가져오기
      );
      const booksSnapshot = await getDocs(booksQuery);

      const booksList = booksSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((book) => !book.isCompleted); // isCompleted가 true인 책은 제외

      setMyBooks(booksList);
    }
  };

  // Fetch reading logs for selected date
  const fetchReadingLogs = async (date) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const logsQuery = query(
        collection(db, "readingLogs"),
        where("userId", "==", user.uid),
        where("date", "==", date)
      );
      const logsSnapshot = await getDocs(logsQuery);
      const logs = logsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReadingLogs(logs);
      await fetchBookDetails(logs);
    }
  };

  // Fetch book details for logs
  const fetchBookDetails = async (logs) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;

    const userId = user.uid;

    const bookDetails = await Promise.all(
      logs
        .filter((log) => log.userId === userId) // 로그인한 사용자만 필터링
        .map(async (log) => {
          let bookData = null;

          // 책 ID(bookId)를 사용해 books 컬렉션에서 조회
          if (log.bookId) {
            const bookRef = doc(db, "books", log.bookId);
            const bookSnap = await getDoc(bookRef);

            if (bookSnap.exists()) {
              bookData = bookSnap.data();
            }
          }

          return {
            cover: bookData?.cover || null,
            title: bookData?.title || log.title || "제목 없음",
            author: bookData?.author || "정보 없음",
            review: log.review || "감상문 없음",
          };
        })
    );

    setBookDetails(bookDetails);
  };

  // Save reading progress
  const addReadingProgress = async () => {
    if (!selectedBook || !pagesRead || pagesRead <= 0 || !selectedDate) {
      Alert.alert("에러", "책, 날짜를 선택하고 읽은 페이지 수를 입력하세요.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const bookRef = doc(db, "books", selectedBook);
      const bookSnap = await getDoc(bookRef);

      if (bookSnap.exists()) {
        const bookData = bookSnap.data();
        const currentPages = bookData.readPages || 0;
        const pageCount = bookData.pageCount || 0;

        // 새로 추가될 읽은 페이지 수
        let newReadPages = currentPages + parseInt(pagesRead, 10);
        let isCompleted = false;

        // 실제로 저장할 읽은 페이지 수 계산
        let validPagesRead = parseInt(pagesRead, 10);

        // readPages가 pageCount를 초과하지 않도록 처리
        if (newReadPages >= pageCount) {
          validPagesRead = pageCount - currentPages;
          newReadPages = pageCount;
          isCompleted = true;
        }

        // Update book data
        await updateDoc(bookRef, {
          readPages: newReadPages,
          ...(isCompleted && {
            isCompleted: true,
            completedDate: selectedDate, // 다 읽은 날짜 저장
          }),
        });

        try {
          // Save reading log
          await addDoc(collection(db, "readingLogs"), {
            userId: user.uid,
            bookId: selectedBook,
            isbn13: bookData.isbn13,
            title: bookData.title,
            date: selectedDate,
            pages: validPagesRead, // 읽은 페이지 수 저장
            review: review.trim(),
          });

          Alert.alert(
            "독서 감상문",
            `읽은 페이지와 감상문이 저장되었습니다.${
              isCompleted ? "\n축하합니다! 책을 다 읽었습니다!"+"\n나의 도서 탭에서 독후감을 작성해 보세요." : ""
            }`
          );

          // 다 읽었으면 myBooks 갱신
          if (isCompleted) {
            await fetchMyBooks();
          }
          
          setIsFormVisible(false);
          setPagesRead("");
          setReview("");
          setSelectedBook(null);
          fetchReadingLogs(selectedDate); // Refresh logs
        } catch (error) {
          Alert.alert("에러", "감상문 저장 중 문제가 발생했습니다.");
        }
      } else {
        Alert.alert("에러", "해당 도서를 찾을 수 없습니다.");
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyBooks();
    }, [])
  );

  useEffect(() => {
    if (selectedDate) {
      fetchReadingLogs(selectedDate);
    }
  }, [selectedDate]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.text}>날짜 선택</Text>
        <Calendar
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setIsFormVisible(false);
            setPagesRead("");
            setReview("");
            setSelectedBook(null);
          }}
          markedDates={selectedDate ? { [selectedDate]: { selected: true, marked: true } } : {}}
        />

        {readingLogs.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.text}>독서 기록</Text>
            {bookDetails.map((detail, index) => (
              <View key={index} style={styles.logContainer}>
                <View style={styles.logHeader}>
                  {detail.cover ? (
                    <Image source={{ uri: detail.cover }} style={styles.coverImage} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text>이미지 없음</Text>
                    </View>
                  )}
                  <View style={styles.logDetails}>
                    <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">
                      {detail.title}
                    </Text>
                    <Text style={styles.bookAuthor}>{detail.author}</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>독서 감상문: {detail.review}</Text>
              </View>
            ))}
          </View>
        )}

        {!isFormVisible && (
          <Button title="독서 기록 작성" onPress={() => setIsFormVisible(true)} />
        )}

        {isFormVisible && (
          <View style={styles.formContainer}>
            <Picker selectedValue={selectedBook} onValueChange={(itemValue) => setSelectedBook(itemValue)}>
              <Picker.Item label="책을 선택하세요" value={null} />
              {myBooks.map((book) => (
                <Picker.Item key={book.id} label={book.title} value={book.id} />
              ))}
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="읽은 페이지 수"
              keyboardType="numeric"
              value={pagesRead}
              onChangeText={setPagesRead}
            />
            <TextInput
              style={styles.input}
              placeholder="독서 감상문"
              multiline
              value={review}
              onChangeText={setReview}
            />
            <View style={styles.buttonGroup}>
              <Button title="저장" onPress={addReadingProgress} />
              <View style={{ marginTop: 10 }}>
                <Button
                  title="닫기"
                  onPress={() => {
                    setIsFormVisible(false);
                    setPagesRead("");
                    setReview("");
                    setSelectedBook(null);
                  }}
                  color="red"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  text: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  logContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  coverImage: {
    width: 50,
    height: 75,
    resizeMode: "cover",
    marginRight: 10,
  },
  placeholderImage: {
    width: 50,
    height: 75,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logDetails: {
    flex: 1,
  },
  bookTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    flexShrink: 1,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#555",
  },
  reviewText: {
    marginTop: 5,
    fontSize: 14,
    color: "#333",
  },
  formContainer: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonGroup: {
    marginTop: 20,
  },
});

export default ReadingScheduleScreen;
