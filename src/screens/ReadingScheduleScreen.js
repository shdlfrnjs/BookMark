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

  const fetchMyBooks = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const booksQuery = query(collection(db, "books"), where("userId", "==", user.uid));
      const booksSnapshot = await getDocs(booksQuery);
      const booksList = booksSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((book) => !book.isCompleted);
      setMyBooks(booksList);
    }
  };

  const fetchReadingLogs = async (date) => {
    const user = getAuth().currentUser;
    if (user) {
      const logsQuery = query(
        collection(db, "readingLogs"),
        where("userId", "==", user.uid),
        where("date", "==", date)
      );
      const logsSnapshot = await getDocs(logsQuery);
      const logs = logsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReadingLogs(logs);
      fetchBookDetails(logs);
    }
  };

  const fetchBookDetails = async (logs) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;

    const details = await Promise.all(
      logs
        .filter((log) => log.userId === userId)
        .map(async (log) => {
          if (log.bookId) {
            const bookSnap = await getDoc(doc(db, "books", log.bookId));
            return bookSnap.exists() ? { ...bookSnap.data(), ...log } : null;
          }
          return null;
        })
    );
    setBookDetails(details.filter(Boolean));
  };

  const addReadingProgress = async () => {
    if (!selectedBook || !pagesRead || pagesRead <= 0 || !selectedDate) {
      Alert.alert("에러", "책, 날짜를 선택하고 읽은 페이지 수를 입력하세요.");
      return;
    }

    const user = getAuth().currentUser;
    if (user) {
      const bookRef = doc(db, "books", selectedBook);
      const bookSnap = await getDoc(bookRef);

      if (bookSnap.exists()) {
        const bookData = bookSnap.data();
        const newReadPages = Math.min(bookData.readPages + +pagesRead, bookData.pageCount);
        const isCompleted = newReadPages >= bookData.pageCount;

        await updateDoc(bookRef, {
          readPages: newReadPages,
          ...(isCompleted && { isCompleted: true, completedDate: selectedDate }),
        });

        await addDoc(collection(db, "readingLogs"), {
          userId: user.uid,
          bookId: selectedBook,
          isbn13: bookData.isbn13,
          title: bookData.title,
          date: selectedDate,
          pages: Math.min(pagesRead, bookData.pageCount - bookData.readPages),
          review: review.trim(),
        });

        Alert.alert(
          "독서 감상문",
          `읽은 페이지와 감상문이 저장되었습니다.${
            isCompleted ? "\n축하합니다! 책을 다 읽었습니다!" : ""
          }`
        );

        if (isCompleted) await fetchMyBooks();

        setIsFormVisible(false);
        setPagesRead("");
        setReview("");
        setSelectedBook(null);
        fetchReadingLogs(selectedDate);
      } else {
        Alert.alert("에러", "해당 도서를 찾을 수 없습니다.");
      }
    }
  };

  useFocusEffect(useCallback(() => fetchMyBooks(), []));
  useEffect(() => selectedDate && fetchReadingLogs(selectedDate), [selectedDate]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.text}>날짜 선택</Text>
        <Calendar
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setIsFormVisible(false);
          }}
          markedDates={selectedDate ? { [selectedDate]: { selected: true, marked: true } } : {}}
        />

        {readingLogs.length > 0 && (
          <View>
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
                  <View>
                    <Text style={styles.bookTitle}>{detail.title}</Text>
                    <Text style={styles.bookAuthor}>{detail.author}</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>독서 감상문: {detail.review}</Text>
              </View>
            ))}
          </View>
        )}

        {!isFormVisible && <Button title="독서 기록 작성" onPress={() => setIsFormVisible(true)} />}
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
            <Button title="저장" onPress={addReadingProgress} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { padding: 20 },
  text: { marginBottom: 10, fontSize: 16, fontWeight: "bold" },
  logContainer: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#ddd", paddingBottom: 10 },
  logHeader: { flexDirection: "row", alignItems: "center" },
  coverImage: { width: 50, height: 75, marginRight: 10 },
  placeholderImage: { width: 50, height: 75, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0" },
  bookTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  bookAuthor: { fontSize: 14, color: "#555" },
  reviewText: { fontSize: 14, color: "#333" },
  formContainer: { marginTop: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10 },
});

export default ReadingScheduleScreen;
