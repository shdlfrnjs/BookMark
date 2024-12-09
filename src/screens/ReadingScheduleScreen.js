import React, { useState, useEffect } from "react";
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
} from "react-native";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";

const ReadingScheduleScreen = () => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [pagesRead, setPagesRead] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [review, setReview] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false); // 폼 표시 상태

  // 나의 도서 목록 가져오기
  const fetchMyBooks = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const booksSnapshot = await getDocs(collection(db, "books"));
      const booksList = booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMyBooks(booksList);
    }
  };

  // 페이지 수 및 감상문 저장
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

        // 읽은 페이지 수 업데이트
        await updateDoc(bookRef, {
          readPages: currentPages + pagesRead,
        });

        // 독서 감상문 저장
        try {
          await addDoc(collection(db, "readingLogs"), {
            userId: user.uid,
            isbn13: bookData.isbn13,
            title: bookData.title,
            date: selectedDate,
            review: review.trim(),
          });

          Alert.alert("성공", `읽은 페이지와 감상문이 저장되었습니다.`);
        } catch (error) {
          Alert.alert("에러", "감상문 저장 중 문제가 발생했습니다.");
        }

        // 입력값 초기화
        setPagesRead("");
        setReview("");
        setSelectedBook(null);
      } else {
        Alert.alert("에러", "해당 도서를 찾을 수 없습니다.");
      }
    }
  };

  // 화면에 도서 목록 불러오기
  useEffect(() => {
    fetchMyBooks();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.text}>날짜 선택:</Text>
        {/* 캘린더 */}
        <Calendar
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setIsFormVisible(false); // 날짜 선택 시 폼 가리기
            setPagesRead(""); // 읽은 페이지 수 초기화
            setReview(""); // 감상문 초기화
            setSelectedBook(null); // 선택된 책 초기화
          }}
          markedDates={selectedDate ? { [selectedDate]: { selected: true, marked: true } } : {}}
        />

        {/* 독서 기록 작성 버튼 */}
        {!isFormVisible && (
          <Button
            title="독서 기록 작성"
            onPress={() => setIsFormVisible(true)}
          />
        )}

        {/* 폼: 독서 기록 작성 */}
        {isFormVisible && (
          <View style={styles.formContainer}>
            {/* 책 선택하기 */}
            <Text style={styles.text}>도서 선택:</Text>
            <Picker
              selectedValue={selectedBook}
              onValueChange={(itemValue) => setSelectedBook(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="책을 선택하세요" value={null} />
              {myBooks.map((book) => (
                <Picker.Item key={book.id} label={book.title} value={book.id} />
              ))}
            </Picker>

            {/* 읽은 페이지 수 입력 */}
            <Text style={styles.text}>읽은 페이지 수:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={pagesRead !== "" ? pagesRead.toString() : ""} // null일 경우 비우기
              onChangeText={(text) => setPagesRead(text ? Number(text) : "")} // 빈 입력은 null로 설정
              placeholder="0" // 0을 기본 가이드로 표시
            />

            {/* 독서 감상문 입력 */}
            <Text style={styles.text}>독서 감상문:</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              multiline
              value={review}
              onChangeText={setReview}
              placeholder="짧은 독서 감상문을 작성해 보세요."
            />

            {/* 저장 버튼 */}
            <Button title="저장" onPress={addReadingProgress} />

            {/* 닫기 버튼 */}
            <Button
              title="닫기"
              onPress={() => {
                setIsFormVisible(false);
                setPagesRead(""); // 입력 초기화
                setReview("");
                setSelectedBook(null);
              }}
              color="red"
            />
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  formContainer: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  picker: {
    marginBottom: 20,
  },
  text: {
    marginBottom: 10, // 각 텍스트 요소에 하단 마진을 추가
  },
});

export default ReadingScheduleScreen;
