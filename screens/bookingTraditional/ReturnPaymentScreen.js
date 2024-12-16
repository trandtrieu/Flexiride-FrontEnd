import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { useAuth } from "../../provider/AuthProvider";
import { useFocusEffect } from "@react-navigation/native";

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
      loadActiveRide();
    }, [])
  );

  useEffect(() => {
    const handleReturnSuccess = async () => {
      try {
        // Lấy thông tin requestDetail từ API
        const response = await axios.get(
          `https://flexiride.onrender.com/booking-traditional/request/${requestId}`
        );

        const request = response.data; // Dữ liệu request trả về từ API
        console.log("🚀 ~ handleReturnSuccess ~ request:", request);

        // Cập nhật trạng thái chuyến đi
        await axios.put(
          `https://flexiride.onrender.com/booking-traditional/update-status/${requestId}`,
          { status: "completed" }
        );

        // Chuẩn bị dữ liệu cho lịch sử thanh toán
        const paymentData = {
          requestId: activeRide?.requestId,
          userId: request?.account_id,
          driverId: authState.userId,
          payment_method: request?.payment_method,
          amount: request?.price || 0, // Giá chuyến đi (từ request detail)
          pickup: `${request?.pickupLocation?.name}, ${request?.pickupLocation?.address}`,
          destination: `${request?.destinationLocation?.name}, ${request?.destinationLocation?.address}`,
          serviceId: request?.service_option_id,
        };

        console.log("🚀 ~ Payment Data:", paymentData);

        // Gửi dữ liệu thanh toán
        const paymentResponse = await axios.post(
          `https://flexiride.onrender.com/payment-history/return-successfully`,
          paymentData,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          }
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
