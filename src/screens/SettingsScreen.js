// src/screens/SettingsScreen.js
import React from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@user_info'); // AsyncStorage에서 사용자 정보 제거
      navigation.replace("Login"); // 로그아웃 후 로그인 화면으로 이동
    } catch (error) {
      Alert.alert("로그아웃 실패", "로그아웃 중 문제가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Button title="로그아웃" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default SettingsScreen;
