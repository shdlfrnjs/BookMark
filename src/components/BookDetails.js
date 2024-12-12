import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Button, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const BookDetails = ({ book, onBack }) => {
  const [pageCount, setPageCount] = useState('');

  const handleAddToLibrary = async () => {
    if (!pageCount || isNaN(pageCount) || Number(pageCount) <= 0) {
      Alert.alert("페이지 수 입력 오류", "유효한 페이지 수를 입력해주세요.");
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert("로그인 필요", "로그인 후 도서를 추가해주세요.");
        return;
      }

      await addDoc(collection(db, "books"), {
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        cover: book.cover,
        isbn13: book.isbn13,
        addedAt: new Date(),
        userId,
        pageCount: Number(pageCount),
      });

      Alert.alert("도서가 나의 도서에 추가되었습니다.");
      setPageCount('');
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
    paddingBottom: 80,
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
    height: 10,
  },
});

export default BookDetails;
