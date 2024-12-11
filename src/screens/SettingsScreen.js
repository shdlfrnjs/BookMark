// src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, Alert } from 'react-native';
import { auth } from '../firebaseConfig'; // Firebase 설정에서 auth 불러오기
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    photoURL: null,
  });

  // 사용자 정보 가져오기
  useEffect(() => {
    const user = auth.currentUser; // 현재 로그인된 사용자 정보 가져오기
    if (user) {
      setUserInfo({
        name: user.displayName || '이름 없음', // displayName이 없을 경우 기본값
        email: user.email,
        photoURL: user.photoURL || 'https://via.placeholder.com/100', // 기본 프로필 이미지 URL
      });
    }
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@user_info'); // AsyncStorage에서 사용자 정보 제거
      await auth.signOut(); // Firebase 로그아웃
      navigation.replace('Login'); // 로그아웃 후 로그인 화면으로 이동
    } catch (error) {
      Alert.alert('로그아웃 실패', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        {/* 프로필 이미지 */}
        <Image source={{ uri: userInfo.photoURL }} style={styles.profileImage} />
        
        {/* 사용자 이름 */}
        <Text style={styles.name}>{userInfo.name}</Text>
        
        {/* 사용자 이메일 */}
        <Text style={styles.email}>{userInfo.email}</Text>
      </View>
      
      {/* 로그아웃 버튼 */}
      <Button title="로그아웃" onPress={handleLogout} style={styles.logoutButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  profileContainer: { alignItems: 'center', marginBottom: 30 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // 원형 이미지
    marginBottom: 20,
  },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  email: { fontSize: 16, color: '#555', marginBottom: 20 },
  logoutButton: { marginTop: 20 },
});

export default SettingsScreen;
