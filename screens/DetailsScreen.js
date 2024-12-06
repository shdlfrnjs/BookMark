import React from 'react';
import { View } from 'react-native';
import BookDetails from '../components/BookDetails';

const DetailsScreen = ({ route, navigation }) => {
  const { book } = route.params;

  return (
    <View>
      <BookDetails book={book} onBack={() => navigation.goBack()} />
    </View>
  );
};

export default DetailsScreen;
