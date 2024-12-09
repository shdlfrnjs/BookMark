import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore'; // Firestore 추가
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 
import firebaseConfig from '../firebase.json'; // Firebase 설정 가져오기

// Firebase 앱 초기화
let app;
if (!app) {
  app = initializeApp(firebaseConfig);
}

// Firebase Auth 초기화 (AsyncStorage 사용)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Firestore 초기화
const db = getFirestore(app);

export { app, auth, db };
