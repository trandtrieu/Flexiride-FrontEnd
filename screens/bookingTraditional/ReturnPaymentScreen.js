import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { useAuth } from "../../provider/AuthProvider";
import { useFocusEffect } from "@react-navigation/native";
import { IP_ADDRESS } from "@env";

const ReturnScreen = ({ route, navigation }) => {
  const { id: paymentId, status, orderCode, requestId } = route.params; // Thêm requestId từ route.params
  const { authState } = useAuth();
  const driverId = authState.userId;
  const [activeRide, setActiveRide] = useState(null);

  const loadActiveRide = async () => {
    try {
      const ride = await AsyncStorage.getItem("activeRide");
      if (ride) {
        const parsedRide = JSON.parse(ride);
        setActiveRide(parsedRide);
        console.log("Active Ride at cancel screen:", parsedRide);
      }
    } catch (error) {
      console.error("Error loading active ride: ", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log("🚀 ~ ReturnScreen ~ route.params:", route.params);

      loadActiveRide();
    }, [])
  );

  useEffect(() => {
    const handleReturnSuccess = async () => {
      try {
        const response = await axios.get(
          `https://flexiride.onrender.com/booking-traditional/request/${requestId}`
        );

        const request = response.data;
        console.log("🚀 ~ handleReturnSuccess ~ request:", request);

        const paymentData = {
          requestId: activeRide?.requestId || requestId,
          userId: request?.account_id,
          driverId: authState.userId,
          payment_method: request?.payment_method,
          amount: request?.price || 0,
          pickup: request?.pickupLocation
            ? `${request.pickupLocation.name}, ${request.pickupLocation.address}`
            : "Không rõ",
          destination: request?.destinationLocation
            ? `${request.destinationLocation.name}, ${request.destinationLocation.address}`
            : "Không rõ",
          serviceId: request?.service_option_id,
        };

        console.log("🚀 ~ Payment Data:", paymentData);

        const paymentResponse = await axios.post(
          `https://flexiride.onrender.com/payment-history/return-successfully`,
          paymentData,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          }
        );
        // Cập nhật trạng thái chuyến đi
        await axios.put(
          `https://flexiride.onrender.com/booking-traditional/update-status/${requestId}`,
          { status: "completed" }
        );

        Alert.alert("Thành công", paymentResponse.data.message, [
          {
            text: "OK",
            onPress: () => navigation.navigate("WalletScreen"),
          },
        ]);
      } catch (error) {
        console.error("Lỗi xử lý thanh toán:", error);
        Alert.alert("Lỗi", "Không thể xử lý giao dịch.");
      }
    };

    if (status === "PAID") {
      handleReturnSuccess();
    } else {
      Alert.alert("Lỗi", "Giao dịch không thành công.");
      navigation.navigate("Home");
    }
  }, [
    paymentId,
    status,
    orderCode,
    requestId,
    driverId,
    authState.token,
    navigation,
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Đang xử lý giao dịch...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
});

export default ReturnScreen;
