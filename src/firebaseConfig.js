import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'; // getAuth 삭제
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 
import firebaseConfig from '../firebase.json'; // firebase.json을 import

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// AsyncStorage를 사용하여 인증 상태를 지속하도록 설정
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage), // persistence 설정
});

export { auth }; 
