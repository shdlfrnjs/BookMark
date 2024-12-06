import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const BookDetails = ({ book, onBack }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{book.title}</Text>
    <Text style={styles.author}>저자: {book.author}</Text>
    <Text style={styles.publisher}>출판사: {book.publisher}</Text>
    <Button title="뒤로가기" onPress={onBack} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  author: {
    marginBottom: 5,
  },
  publisher: {
    marginBottom: 20,
  },
});

export default BookDetails;
