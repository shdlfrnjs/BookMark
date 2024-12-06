// src/components/BookDetails.js
import React from "react";
import { View, Text, Image, StyleSheet, Button } from "react-native";

const BookDetails = ({ book, onBack }) => (
  <View style={styles.detailsContainer}>
    {book.cover ? (
      <Image source={{ uri: book.cover }} style={styles.detailsImage} />
    ) : (
      <Text>No Image</Text>
    )}
    <Text style={styles.detailsTitle}>{book.title}</Text>
    <Text style={styles.detailsText}>저자: {book.author}</Text>
    <Text style={styles.detailsText}>출판사: {book.publisher}</Text>
    <Text style={styles.detailsText}>출판일: {book.pubDate}</Text>
    <Text style={styles.detailsText}>가격: {book.priceStandard}원</Text>
    <Text style={styles.detailsText}>설명: {book.description}</Text>
    <Button title="뒤로" onPress={onBack} />
  </View>
);

const styles = StyleSheet.create({
  detailsContainer: { padding: 20, backgroundColor: "#fff", flex: 1 },
  detailsImage: { width: 150, height: 225, marginBottom: 10 },
  detailsTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  detailsText: { fontSize: 16, marginBottom: 5 },
});

export default BookDetails;
