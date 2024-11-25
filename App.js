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
import HireDriver from "./screens/hireDriver/HireDriverScreen";

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

// BookingCarpool
import { ServiceSelectionScreen } from "./screens/bookingCarpool/ServiceSelectionScreen";
import { CarpoolRequestScreen } from "./screens/bookingCarpool/CarpoolRequestScreen";
import { AvailableRidesScreen } from "./screens/bookingCarpool/AvailableRidesScreen";
import { ConfirmBookingScreen } from "./screens/bookingCarpool/ConfirmBookingScreen";
import { ManageBookingScreen } from "./screens/bookingCarpool/ManageBookingScreen";
import { NotificationsScreen } from "./screens/bookingCarpool/NotificationsScreen";
import { SucessfullScreen } from "./screens/bookingCarpool/SuccessfullSceen";
import { FeedbackScreen } from "./screens/bookingCarpool/FeedbackScreen";
import { TypeService } from "./screens/bookingCarpool/TypeService";

import { DriverAvailableRidesScreen } from "./screens/bookingCarpoolDriver/DriverAvailableRidesScreen";
import { ManageDriverRidesScreen } from "./screens/bookingCarpoolDriver/ManageDriverRidesScreen";
import { PickupProgressScreen } from "./screens/bookingCarpoolDriver/PickupProgressScreen";

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

              {/* Screens for booking carpool */}
              <Stack.Screen
                name="ServiceSelection"
                component={ServiceSelectionScreen}
              />
              <Stack.Screen
                name="CarpoolRequest"
                component={CarpoolRequestScreen}
              />
              <Stack.Screen name="Sucessfull" component={SucessfullScreen} />
              <Stack.Screen
                name="AvailableRides"
                component={AvailableRidesScreen}
              />
              <Stack.Screen
                name="ConfirmBooking"
                component={ConfirmBookingScreen}
              />
              <Stack.Screen
                name="ManageBooking"
                component={ManageBookingScreen}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
              />
              <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
              <Stack.Screen name="TypeService" component={TypeService} />

              {/* Screens for booking carpool driver */}
              <Stack.Screen
                name="DriverAvailableRides"
                component={DriverAvailableRidesScreen}
              />
              <Stack.Screen
                name="ManageDriverRides"
                component={ManageDriverRidesScreen}
              />
              <Stack.Screen
                name="PickupProgress"
                component={PickupProgressScreen}
              />
              {/* Screens for hire driver */}
              <Stack.Screen
                name="HireDriver"
                component={HireDriver}
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
