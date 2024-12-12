import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from "./screens/HomeScreen";
import DetailsScreen from "./screens/DetailsScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import SettingsScreen from "./screens/SettingsScreen";
import MyBooksScreen from "./screens/MyBooksScreen";
import MyReadingLogs from "./screens/MyReadingLogs";
import ReadingScheduleScreen from "./screens/ReadingScheduleScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await AsyncStorage.getItem('@user_info');
        if (user) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("로그인 상태 확인 중 오류 발생", error);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  const TabNavigator = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case "도서 검색":
              iconName = "search-outline";
              break;
            case "독서 일정":
              iconName = "calendar-outline";
              break;
            case "나의 도서":
              iconName = "book-outline";
              break;
            case "마이페이지":
              iconName = "person-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="도서 검색" component={HomeScreen} />
      <Tab.Screen name="독서 일정" component={ReadingScheduleScreen} />
      <Tab.Screen name="나의 도서" component={MyBooksScreen} />
      <Tab.Screen name="마이페이지" component={SettingsScreen} />
    </Tab.Navigator>
  );

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "Tab" : "Login"}>
        <Stack.Screen name="Tab" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="나의 독서 기록" component={MyReadingLogs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
