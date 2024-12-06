// src/screens/DetailsScreen.js
import React from "react";
import { View, StyleSheet } from "react-native";
import BookDetails from "../components/BookDetails";

const DetailsScreen = ({ route, navigation }) => {
  const { book } = route.params; // route.params에서 book 객체 받기

  return (
    <View style={styles.container}>
      {/* BookDetails 컴포넌트를 이용해 책 상세 정보 표시 */}
      <BookDetails book={book} onBack={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" }, // 기본 스타일
});

export default DetailsScreen;
