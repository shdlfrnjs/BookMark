import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const BookList = ({ books, onSelectBook }) => (
  <FlatList
    data={books}
    keyExtractor={(item) => item.itemId.toString()}
    renderItem={({ item }) => (
      <TouchableOpacity onPress={() => onSelectBook(item)}>
        <View style={styles.item}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.author}>{item.author}</Text>
        </View>
      </TouchableOpacity>
    )}
  />
);

const styles = StyleSheet.create({
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontWeight: 'bold',
  },
  author: {
    color: '#555',
  },
});

export default BookList;
