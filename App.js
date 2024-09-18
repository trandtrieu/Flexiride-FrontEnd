import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./screens/Home";
import Splash from "./screens/Splash";

import Login from "./screens/auth/Login";
import VerificationScreen from "./screens/auth/VerificationScreen";
import Register from "./screens/auth/Register";
import LoginOptions from "./screens/auth/LoginOptions";
import Authenticate from "./screens/auth/Authenticate";
import EnterNameScreen from "./screens/auth/EnterNameScreen";
import VerifyWithSelfie from "./screens/auth/VerifyWithSelfie";

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Authenticate"
          component={Authenticate}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LoginOptions"
          component={LoginOptions}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerificationScreen"
          component={VerificationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EnterNameScreen"
          component={EnterNameScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifyWithSelfie"
          component={VerifyWithSelfie}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
