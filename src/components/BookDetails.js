// src/components/BookDetails.js
import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Button, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { db, auth } from "../firebaseConfig"; // Firestore와 Auth import
import { collection, addDoc } from "firebase/firestore"; // Firestore에 데이터 추가 함수

const BookDetails = ({ book, onBack }) => {
  const [pageCount, setPageCount] = useState(''); // 페이지 수 입력 상태 관리

  // 나의 도서에 담기 함수
  const handleAddToLibrary = async () => {
    // 페이지 수가 비어있는지 확인
    if (!pageCount || isNaN(pageCount) || Number(pageCount) <= 0) {
      Alert.alert("페이지 수 입력 오류", "유효한 페이지 수를 입력해주세요.");
      return;
    }

    try {
      // 현재 로그인한 사용자 UID 가져오기
      const userId = auth.currentUser?.uid; // 사용자의 UID를 가져옵니다.

      if (!userId) {
        Alert.alert("로그인 필요", "로그인 후 도서를 추가해주세요.");
        return;
      }

      // Firestore에 도서 정보 추가
      const docRef = await addDoc(collection(db, "books"), {
        title: book.title,           // 도서 제목
        author: book.author,         // 저자
        publisher: book.publisher,   // 출판사
        cover: book.cover,           // 커버 이미지 URL
        isbn13: book.isbn13,         // 13자리 ISBN
        addedAt: new Date(),         // 추가 시간
        userId: userId,              // 사용자 UID
        pageCount: Number(pageCount),// 총 페이지 수
      });

      Alert.alert("도서가 나의 도서에 추가되었습니다!");
      setPageCount(''); // 입력 후 페이지 수 초기화
      onBack();
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("도서 추가 실패", error.message);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.detailsContainer}>
        <View style={styles.detailsImageContainer}>
          {book.cover ? (
            <Image source={{ uri: book.cover }} style={styles.detailsImage} />
          ) : (
            <Text>No Image</Text>
          )}
        </View>
        <Text style={styles.detailsTitle}>{book.title}</Text>
        <Text style={styles.detailsText}>저자: {book.author}</Text>
        <Text style={styles.detailsText}>출판사: {book.publisher}</Text>
        <Text style={styles.detailsText}>출판일: {book.pubDate}</Text>
        <Text style={styles.detailsText}>설명: {book.description}</Text>
      </ScrollView>

      {/* 페이지 수 입력 필드 및 버튼들 */}
      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          placeholder="총 페이지 수"
          keyboardType="numeric"
          value={pageCount}
          onChangeText={setPageCount}
        />
        <Button title="나의 도서에 담기" onPress={handleAddToLibrary} />
        <View style={styles.buttonSpacer} />
        <Button title="뒤로" onPress={onBack} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  detailsContainer: { 
    padding: 20, 
    backgroundColor: "#fff", 
    flexGrow: 1, 
    paddingBottom: 80, // ScrollView 내부에서 내용이 화면을 벗어나지 않게 하기 위해 여백 추가
  },
  detailsImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  detailsImage: { 
    width: 150, 
    height: 225, 
    marginBottom: 10,
  },
  detailsTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 10,
  },
  detailsText: { 
    fontSize: 16, 
    marginBottom: 5,
    lineHeight: 22,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  buttonSpacer: {
    height: 10, // 버튼 간격을 위한 높이
  },
});

export default BookDetails;
