// src/App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import DetailsScreen from "./screens/DetailsScreen";

const Stack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "책 검색" }} />
      <Stack.Screen name="Details" component={DetailsScreen} options={{ title: "책 정보" }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
