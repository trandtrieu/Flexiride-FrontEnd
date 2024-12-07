import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./screens/Home";
import Splash from "./screens/Splash";

import Login from "./screens/auth/Login";
import Register from "./screens/auth/Register";
import Authenticate from "./screens/auth/Authenticate";
import EnterNameScreen from "./screens/auth/EnterNameScreen";
import VerifyWithSelfie from "./screens/auth/VerifyWithSelfie";
import { AuthProvider } from "./provider/AuthProvider";
// import TestMap from "./screens/TestMap";
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
import PaymentScreen from "./screens/bookingTraditional/PaymentScreen";
import CancelScreen from "./screens/bookingTraditional/CancelPaymentScreen";
import ReturnScreen from "./screens/bookingTraditional/ReturnPaymentScreen";

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
import RideDetailScreen from "./screens/bookingCarpool/RideDetailScreen";
import { ViewAllAvailableRideScreen } from "./screens/bookingCarpool/ViewAllAvailableRideScreen";
import { JoinRequestScreen } from "./screens/bookingCarpool/JoinRequestScreen";

import { DriverAvailableRidesScreen } from "./screens/bookingCarpoolDriver/DriverAvailableRidesScreen";
import { ManageDriverRidesScreen } from "./screens/bookingCarpoolDriver/ManageDriverRidesScreen";
import { PickupProgressScreen } from "./screens/bookingCarpoolDriver/PickupProgressScreen";
import InsertCode from "./screens/auth/InsertCode";
import ForgotPasswordDriver from "./screens/forgot-pass/ForgotPasswordDriver";
import EnterOtp from "./screens/forgot-pass/EnterOtp";
import EnterNewPass from "./screens/forgot-pass/EnterNewPass";
import ChangePassSuccess from "./screens/forgot-pass/ChangePassSuccess";
import CustomerProfile from "./screens/profile/CustomerProfile";
import UpdateCusInfo from "./screens/profile/UpdateCusInfo";
import ChangePassword from "./screens/auth/ChangePassword";
import ManageNotifications from "./screens/ManageNotificationScreen";
import NotificationDetail from "./screens/NotificationDetail";

// HireDriver
import TermsScreen from "./screens/hireDriver/TermsScreen";

import HireDriverServiceOption from "./screens/hireDriver/HireDriverServiceOptionScreen"
import HireDriverRequestScreen from "./screens/hireDriver/HireDriverRequestScreen"
import HireRouteScreen from "./screens/hireDriver/HireRouteScreen"
import HireMapScreen from "./screens/hireDriver/HireMapScreen"
import HireLocationPicker from "./screens/hireDriver/HireLocationPicker"
import HireDriverScreen from "./screens/hireDriver/HireDriverScreen";
import SingleRouteScreen from "./screens/bookingCarpool/SingleRouteScreen"

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
              {/* <Stack.Screen
                name="LoginOptions"
                component={LoginOptions}
                options={{ headerShown: false }}
              /> */}
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
                name="InsertCode"
                component={InsertCode}
                options={{ headerShown: false }}
              />
              {/* <Stack.Screen
                name="VerificationScreen"
                component={VerificationScreen}
                options={{ headerShown: false }}
              /> */}
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
              {/* <Stack.Screen
                name="SearchScreen"
                component={SearchScreen}
                options={{ headerShown: false }}
              /> */}
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
              {/* <Stack.Screen
                name="TestMap"
                component={TestMap}
                options={{ headerShown: false }}
              /> */}
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
              <Stack.Screen name="RideDetailScreen" component={RideDetailScreen} />
              <Stack.Screen name="ViewAllAvailableRideScreen" component={ViewAllAvailableRideScreen} />
              <Stack.Screen name="JoinRequestScreen" component={JoinRequestScreen} />

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
              {/* start Forgot-pass */}
              <Stack.Screen
                name="ForgotPasswordDriver"
                component={ForgotPasswordDriver}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EnterOtp"
                component={EnterOtp}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EnterNewPass"
                component={EnterNewPass}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChangePassSuccess"
                component={ChangePassSuccess}
                options={{ headerShown: false }}
              />
              {/* end forgot pass */}
              {/* Start profile customer */}
              <Stack.Screen
                name="CustomerProfile"
                component={CustomerProfile}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="UpdateCusInfo"
                component={UpdateCusInfo}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChangePassword"
                component={ChangePassword}
                options={{ headerShown: false }}
              />
              {/* end profile customer */}
              <Stack.Screen
                name="SingleRoute"
                component={SingleRouteScreen}
              />
              {/* Screens for hire driver */}
              <Stack.Screen name="HireDriverScreen" component={HireDriverScreen} options={{ headerShown: false }} />
              <Stack.Screen name="TermsScreen" component={TermsScreen} options={{ headerShown: false }} />

              <Stack.Screen name="HireDriverServiceOption" component={HireDriverServiceOption} options={{ headerShown: false }} />
              <Stack.Screen name="HireDriverRequestScreen" component={HireDriverRequestScreen} options={{ headerShown: false }} />
              <Stack.Screen name="HireRouteScreen" component={HireRouteScreen} options={{ headerShown: false }} />
              <Stack.Screen name="HireMapScreen" component={HireMapScreen} options={{ headerShown: false }} />
              <Stack.Screen name="HireLocationPicker" component={HireLocationPicker} options={{ headerShown: false }} />

              <Stack.Screen
                name="ManageNotifications"
                component={ManageNotifications}
              />
              <Stack.Screen
                name="NotificationDetail"
                component={NotificationDetail}
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
