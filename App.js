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
import ActivityScreen from "./screens/ActivityScreen";
import PaymentScreen from "./screens/bookingTraditional/PaymentScreen";
import CancelScreen from "./screens/bookingTraditional/CancelPaymentScreen";
import ReturnScreen from "./screens/bookingTraditional/ReturnPaymentScreen";

export default function App() {
  const Stack = createNativeStackNavigator();
  const linking = {
    prefixes: ["flexiride://"], // Đảm bảo trùng với scheme trong `app.json`
    config: {
      screens: {
        PaymentScreen: "ReturnScreen", // Callback thành công
        Home: "CancelScreen", // Callback hủy
      },
    },
  };
  return (
    <SocketProvider>
      <LocationProvider>
        <AuthProvider>
          <NavigationContainer linking={linking}>
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
                options={{ title: "Đăng ký" }}
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
                options={{ title: "Theo dõi tài xế" }}
              />
              <Stack.Screen
                name="ActivityScreen"
                component={ActivityScreen}
                options={{ title: "Lịch sử hoạt động" }}
              />
              <Stack.Screen
                name="ChatScreenCustomer"
                component={ChatScreenCustomer}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PaymentScreen"
                component={PaymentScreen}
                options={{ title: "Thanh toán" }}
              />
              <Stack.Screen
                name="ReturnScreen"
                component={ReturnScreen}
                options={{ title: "Thanh toán thành công" }}
              />
              <Stack.Screen
                name="CancelScreen"
                component={CancelScreen}
                options={{ title: "Thanh toán bị hủy" }}
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
