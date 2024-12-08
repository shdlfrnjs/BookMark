import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage"; // AsyncStorage 임포트
import HomeScreen from "./screens/HomeScreen";
import DetailsScreen from "./screens/DetailsScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import SettingsScreen from "./screens/SettingsScreen"; // 설정 화면 추가

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator(); // Tab.Navigator 사용

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await AsyncStorage.getItem('@user_info'); // 저장된 사용자 정보 확인
        if (user) {
          setIsLoggedIn(true); // 로그인 정보가 있으면 로그인 상태로 설정
        }
      } catch (error) {
        console.error("로그인 상태 확인 중 오류 발생", error);
      } finally {
        setLoading(false); // 데이터 확인 후 로딩 상태 종료
      }
    };
    checkLoginStatus();
  }, []);

  const TabNavigator = () => (
    <Tab.Navigator>
      <Tab.Screen name="검색" component={HomeScreen} />
      <Tab.Screen name="설정" component={SettingsScreen} />
    </Tab.Navigator>
  );

  if (loading) {
    return null; // 로딩 중일 때 아무 화면도 표시하지 않음
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "Tab" : "Login"}>
        <Stack.Screen name="Tab" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
