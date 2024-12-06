// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Node.js 환경에서는 require 사용
const firebaseConfig = require('./firebase.json');

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase Authentication 설정
export const auth = getAuth(app);
