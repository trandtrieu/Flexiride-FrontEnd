import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const CancelScreen = ({ route, navigation }) => {
  const { id: paymentId, orderCode } = route.params || {};
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
    if (!paymentId || !orderCode) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin giao dịch. Vui lòng kiểm tra lại.",
        [
          {
            text: "OK",
            onPress: () => {
              if (activeRide?.requestId) {
                navigation.replace("PaymentScreen", {
                  requestId: activeRide.requestId,
                });
              } else {
                navigation.navigate("Home");
              }
            },
          },
        ]
      );
    }
  }, [paymentId, orderCode, navigation, activeRide]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Giao dịch đã bị hủy.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.replace("PaymentScreen", {
            requestId: activeRide?.requestId,
          })
        }
      >
        <Text style={styles.buttonText}>Quay lại thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CancelScreen;
