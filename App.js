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
import { AuthProvider } from "./provider/AuthProvider";
import { LocationProvider } from "./provider/LocationCurrentProvider";
import { SocketProvider } from "./provider/SocketProvider";
import BikeBook from "./screens/bookingTraditional/BikeBookScreen";
import ChatScreenCustomer from "./screens/bookingTraditional/ChatScreen";
import PaymentMethodsScreen from "./screens/bookingTraditional/PaymentMethod";
import RouteScreen from "./screens/bookingTraditional/RouteScreen";
import MapScreen from "./screens/bookingTraditional/MapScreen";
import RideTrackingScreen from "./screens/bookingTraditional/RideTrackingScreen";
import LocationPicker from "./screens/bookingTraditional/LocationPicker";

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <SocketProvider>
      <LocationProvider>
        <AuthProvider>
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
              <Stack.Screen
                name="BikeBook"
                component={BikeBook}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="LocationPicker"
                component={LocationPicker}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MapScreen"
                component={MapScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RouteScreen"
                component={RouteScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="PaymentMethod"
                component={PaymentMethodsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RideTrackingScreen"
                component={RideTrackingScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChatScreenCustomer"
                component={ChatScreenCustomer}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </LocationProvider>
    </SocketProvider>
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
