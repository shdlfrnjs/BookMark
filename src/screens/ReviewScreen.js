import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";

const ReviewScreen = ({ route, navigation }) => {
  const { isbn13, title } = route.params; 
  const [bookReport, setBookReport] = useState("");

  const handleSaveBookReport = async () => {
    if (bookReport.trim() === "") {
      Alert.alert("오류", "전체 독후감을 작성해주세요.");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const currentDate = new Date().toISOString().split("T")[0];

        // Firestore 컬렉션에 저장 (컬렉션 이름 : bookReport)
        await addDoc(collection(db, "bookReport"), {
          userId,
          isbn13,
          title,
          bookReport: bookReport.trim(),
          date: currentDate,
        });

        Alert.alert("성공", "독후감이 저장되었습니다.", [
          {
            text: "확인",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("오류", "사용자 인증이 필요합니다.");
      }
    } catch (error) {
      console.error("독후감 저장 중 오류 발생:", error);
      Alert.alert("오류", "독후감을 저장하지 못했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>전체 독후감 작성</Text>
      <Text style={styles.subtitle}>책 제목: {title}</Text>

      <TextInput
        style={styles.input}
        placeholder="전체 독후감을 작성하세요..."
        value={bookReport}
        onChangeText={setBookReport}
        multiline
      />
      <Button title="저장하기" onPress={handleSaveBookReport} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
    color: "#666",
  },
  input: {
    flex: 1,
    textAlignVertical: "top",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
    marginBottom: 16,
  },
});

export default ReviewScreen;
