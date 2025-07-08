import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import DashboardScreen from "../screens/DashboardScreen";
import LessonScreen from "../screens/LessonScreen";
import LessonDetailsScreen from "../screens/LessonDetailtsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerShown: false,
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            headerShown: false,
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="Lesson"
          component={LessonScreen}
          options={{
            headerShown: false,
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="LessonDetails"
          component={LessonDetailsScreen}
          options={{
            headerShown: false,
            headerLeft: () => null,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
