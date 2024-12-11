import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { auth, storage } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons"; // expo-vector-icons에서 아이콘 임포트

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [defaultImage, setDefaultImage] = useState(null); // 기본 이미지 URL 상태
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  // 기본 이미지 URL을 Firebase에서 가져오는 useEffect
  useEffect(() => {
    const fetchDefaultImage = async () => {
      try {
        const defaultImageRef = ref(storage, "default-profile.png"); // 기본 이미지 경로
        const url = await getDownloadURL(defaultImageRef);
        setDefaultImage(url); // 기본 이미지 URL 설정
        setLoading(false); // 이미지 로딩 완료 후 로딩 상태 false로 변경
      } catch (error) {
        console.error("기본 이미지 불러오기 오류:", error.message);
        setLoading(false); // 오류 발생 시에도 로딩 상태 false로 변경
      }
    };

    fetchDefaultImage();
  }, []);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("입력 오류", "모든 필드를 입력해주세요.");
      return;
    }

    try {
      // 이메일과 비밀번호로 회원가입
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let photoURL = null;

      // 프로필 이미지가 선택된 경우 업로드
      if (profileImage) {
        const imageRef = ref(storage, `profileImages/${user.uid}.jpg`);
        const response = await fetch(profileImage);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);
        photoURL = await getDownloadURL(imageRef);
      } else {
        // 프로필 이미지가 선택되지 않으면 기본 이미지 URL 사용
        photoURL = defaultImage;
      }

      // Firebase 사용자 프로필 업데이트
      await updateProfile(user, {
        displayName: name,
        photoURL: photoURL || null,
      });

      Alert.alert("회원가입 성공", "로그인 화면으로 이동합니다.");
      navigation.goBack();
    } catch (error) {
      console.error("회원가입 실패:", error.message);
      Alert.alert("회원가입 실패", error.message);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      } else {
        console.log("이미지 선택 취소");
      }
    } catch (error) {
      console.error("이미지 선택 오류:", error.message);
      Alert.alert("이미지 선택 오류", "이미지를 선택하는 중 문제가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      {/* 기본 이미지가 로드되기 전 로딩 스피너 표시 */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: profileImage || defaultImage }} // 기본 이미지가 없으면 선택한 이미지 사용
            style={styles.image}
          />
          {/* 카메라 아이콘을 이미지 테두리 우측 하단에 배치 */}
          <TouchableOpacity onPress={pickImage} style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={20} color="black" />
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="이름"
        value={name}
        onChangeText={setName}
      />
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
      <Button title="회원가입" onPress={handleSignup} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderColor: "#ccc", borderRadius: 5 },
  imageWrapper: {
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
    position: "relative", // 아이콘을 절대 위치로 배치하기 위해
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50, // 원형으로 만들기
  },
  cameraIconContainer: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // 아이콘의 배경을 반투명 화이트로 설정
    padding: 8,
    borderRadius: 50, // 아이콘도 원형으로 설정
    transform: [
      { translateX: 35 },  // 좌우 미세 조정
      { translateY: 35 }  // 상하 미세 조정
    ]
  },
});

export default SignupScreen;
