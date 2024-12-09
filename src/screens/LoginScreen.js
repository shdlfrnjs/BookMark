// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 로그인 성공 시, 사용자 정보를 AsyncStorage에 저장
      await AsyncStorage.setItem('@user_info', JSON.stringify(user));

      Alert.alert('로그인 성공', '홈 화면으로 이동합니다.');
      navigation.replace("Tab"); // 로그인 성공 시 Home으로 이동
    } catch (error) {
      Alert.alert("로그인 실패", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button title="로그인" onPress={handleLogin} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="회원가입"
          onPress={() => navigation.navigate("Signup")} // 회원가입 페이지로 이동
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderColor: "#ccc" },
  buttonContainer: {
    marginBottom: 10, // 버튼 사이에 마진 추가
  },
});

export default LoginScreen;
