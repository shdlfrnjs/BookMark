// src/components/BookList.js
import React from "react";
import { FlatList, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const BookList = ({ books, onSelectBook }) => (
  <FlatList
    data={books}
    keyExtractor={(item) => item.itemId.toString()}
    renderItem={({ item }) => (
      <TouchableOpacity style={styles.item} onPress={() => onSelectBook(item)}>
        {item.cover ? (
          <Image source={{ uri: item.cover }} style={styles.image} />
        ) : (
          <Text>No Image</Text>
        )}
        <Text style={styles.title}>{item.title}</Text>
        <Text>{item.author}</Text>
        <Text>{item.priceStandard}원</Text>
      </TouchableOpacity>
    )}
  />
);

const styles = StyleSheet.create({
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  image: { width: 50, height: 75, marginBottom: 10 },
  title: { fontWeight: "bold" },
});

export default BookList;
