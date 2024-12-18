import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  BackHandler,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import io from "socket.io-client";
import { IP_ADDRESS, VIETMAP_API_KEY } from "@env";
import polyline from "@mapbox/polyline";
import { useAuth } from "../../provider/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

// Utility Functions
const fetchRequestDetails = async (requestId) => {
  try {
    const response = await axios.get(
      `https://flexiride.onrender.com/booking-traditional/request/${requestId}`
    );
    if (response.data) {
      console.log("🚀 ~ fetchRequestDetails ~ response.data:", response.data);
      return {
        pickup: {
          latitude: response.data.latitude_from,
          longitude: response.data.longitude_from,
          address: response.data.pickup,
        },
        destination: {
          latitude: response.data.latitude_to,
          longitude: response.data.longitude_to,
          address: response.data.destination,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching request detailsss: ", error);
    throw new Error("Unable to fetch request details.");
  }
};

const fetchDriverDetails = async (driverId) => {
  try {
    const response = await axios.get(
      `https://flexiride.onrender.com/booking-traditional/location/driver/${driverId}`
    );
    if (response.data && response.data.location) {
      return {
        location: {
          latitude: response.data.location.coordinates[1],
          longitude: response.data.location.coordinates[0],
        },
        details: response.data.driverDetails,
        status: response.data.status,
      };
    }
  } catch (error) {
    console.error("Error fetching driver details:", error);
    throw new Error("Unable to fetch driver details.");
  }
};

const calculateRoute = async (driverLocation, pickupLocation, setRouteData) => {
  try {
    const response = await axios.get(
      `https://maps.vietmap.vn/api/route?apikey=${VIETMAP_API_KEY}&point=${driverLocation.latitude},${driverLocation.longitude}&point=${pickupLocation.latitude},${pickupLocation.longitude}&vehicle=car&points_encoded=true`
    );

    if (response.data && response.data.paths.length > 0) {
      const decodedPoints = polyline.decode(response.data.paths[0].points);
      const coordinates = decodedPoints.map((point) => ({
        latitude: point[0],
        longitude: point[1],
      }));
      const { distance, time } = response.data.paths[0];

      setRouteData({
        coordinates,
        estimatedDistance: distance / 1000,
        estimatedTime: Math.ceil(time / 1000 / 60),
      });
    } else {
      throw new Error("No route data available .");
    }
  } catch (error) {
    console.error("Error calculating route: ", error);
    throw new Error("Unable to calculate route.");
  }
};

// Main Component
const RideTrackingScreen = ({ route, navigation }) => {
  const { requestId, driverId } = route.params;

  const [pickupLocation, setPickupLocation] = useState(null);
  const [destination, setDestination] = useState(null);

  const [driverLocation, setDriverLocation] = useState(null);
  const [driverDetails, setDriverDetails] = useState({});
  const [driverStatus, setDriverStatus] = useState("Đang đến");

  const [routeData, setRouteData] = useState({
    coordinates: [],
    estimatedDistance: "",
    estimatedTime: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const socket = useRef(null);
  const { authState } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const fetchRequestStatus = async () => {
    try {
      const response = await axios.get(
        `https://flexiride.onrender.com/booking-traditional/request/${requestId}`
      );
      if (response.data) {
        setDriverStatus(response.data.status);

        return response.data.status;
      } else {
        console.warn("No request data found.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching request status:  ", error);
      return null;
    }
  };
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const currentStatus = await fetchRequestStatus();
      if (currentStatus === "dropped off") {
        navigation.navigate("PaymentScreen", { requestId });
        clearInterval(intervalId);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [requestId, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.replace("Home");
        return true;
      };
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [navigation])
  );

  useEffect(() => {
    const updateRoute = async () => {
      try {
        if (driverStatus === "on trip" || driverStatus === "picked up") {
          await calculateRoute(pickupLocation, destination, setRouteData);
        } else if (
          driverStatus === "on the way" ||
          driverStatus === "confirmed"
        ) {
          await calculateRoute(driverLocation, pickupLocation, setRouteData);
        }
      } catch (error) {
        console.error("Error updating route:", error);
      }
    };

    if (pickupLocation && destination && driverLocation) {
      updateRoute();
    }
  }, [driverStatus, pickupLocation, destination, driverLocation]);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(`https://flexiride.onrender.com`, {
        transports: ["websocket"],
        query: { customerId: authState.userId },
      });

      socket.current.on("driverLocationUpdate", (data) => {
        if (data.driverId === driverId) {
          setDriverLocation({
            latitude: data.location.coordinates[1],
            longitude: data.location.coordinates[0],
          });
        } else {
          // console.warn(
          //   "Location update ignored for other driver:",
          //   data.driverId
          // );
        }
      });

      socket.current.on("updateStatus", (data) => {
        const { requestId: updatedRequestId, newStatus } = data;
        if (updatedRequestId === requestId) {
          setDriverStatus(newStatus);
        }
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [driverId, requestId]);
  useEffect(() => {
    if (driverLocation && pickupLocation) {
      calculateRoute(driverLocation, pickupLocation, setRouteData);
    }
  }, [driverLocation, pickupLocation]);
  useEffect(() => {
    if (driverLocation && pickupLocation && routeData.coordinates.length > 0) {
      calculateRoute(driverLocation, pickupLocation, setRouteData);
    }
  }, [driverLocation]);
  useEffect(() => {
    if (routeData.coordinates.length > 0) {
      mapRef.current?.fitToCoordinates(routeData.coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [routeData.coordinates]);

  const toggleModal = () => setIsModalVisible(!isModalVisible);
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const { pickup, destination } = await fetchRequestDetails(requestId);
        setPickupLocation(pickup);

        setDestination(destination);

        const driver = await fetchDriverDetails(driverId);
        setDriverLocation(driver.location);
        setDriverDetails(driver.details);

        await calculateRoute(driver.location, pickup, setRouteData);
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    socket.current = io(`https://flexiride.onrender.com`, {
      transports: ["websocket"],
      query: { driverId },
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [requestId, driverId]);

  const handleChat = () => {
    navigation.navigate("ChatScreenCustomer", {
      userId: authState.userId,
      role: "customer",
      driverId,
      roomId: requestId,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFA5" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleCancelRide = async () => {
    try {
      // Kiểm tra trạng thái chuyến đi

      // Chỉ cho phép hủy nếu trạng thái chưa đến điểm đón
      if (driverStatus === "confirmed" || driverStatus === "on the way") {
        Alert.alert(
          "Xác nhận",
          "Bạn có chắc muốn hủy chuyến đi?",
          [
            { text: "Không", style: "cancel" },
            {
              text: "Hủy chuyến",
              style: "destructive",
              onPress: () => {
                if (socket.current) {
                  // Gửi sự kiện hủy chuyến qua socket
                  socket.current.emit("cancelRide", {
                    requestId,
                    customerId: authState.userId,
                  });

                  // Lắng nghe phản hồi từ server
                  socket.current.on("rideCanceledSuccess", () => {
                    AsyncStorage.removeItem("activeRide");
                    navigation.replace("Home");
                  });

                  socket.current.on("cancelError", (error) => {
                    Alert.alert("Lỗi", error.message);
                  });
                } else {
                  Alert.alert("Lỗi", "Kết nối socket không khả dụng.");
                }
              },
            },
          ],
          { cancelable: true }
        );
      } else {
        Alert.alert(
          "Không thể hủy",
          "Tài xế đã đến điểm đón hoặc đã bắt đầu chuyến đi."
        );
      }
    } catch (error) {
      console.error("Error canceling ride: ", error);
      Alert.alert("Lỗi", "Không thể kiểm tra trạng thái chuyến đi.");
    }
  };
  const handleBackPress = () => {
    navigation.replace("Home");
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }}
      >
        <Marker
          coordinate={pickupLocation}
          title="Điểm đón"
          // description={pickupLocation.name}
        >
          <Image
            source={require("../../assets/pickup-icon.png")}
            style={{ width: 30, height: 30 }}
          />
        </Marker>
        <Marker coordinate={driverLocation}>
          <Image
            source={require("../../assets/bike-icon.png")}
            style={{ width: 30, height: 30 }}
          />
        </Marker>

        <Marker coordinate={destination} title="Điểm đến">
          <Image
            source={require("../../assets/destination-icon.png")} // Replace with your destination icon path
            style={{ width: 30, height: 30 }}
          />
        </Marker>

        {routeData.coordinates.length > 0 && (
          <Polyline
            coordinates={routeData.coordinates}
            strokeColor="blue"
            strokeWidth={10}
          />
        )}
      </MapView>

      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" type="ionicon" color="#000" size={25} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Trạng thái:{" "}
          <Text style={{ fontWeight: "bold", color: "blue" }}>
            {driverStatus === "confirmed" || driverStatus === "on the way"
              ? "Đang đến"
              : driverStatus === "picked up"
              ? "Đã đón khách"
              : driverStatus === "on trip"
              ? "Đang trên đường"
              : driverStatus === "dropped off"
              ? "Đã hoàn thành chuyến đi"
              : "Đang tải..."}
          </Text>
        </Text>

        <Text style={styles.infoText}>
          Khoảng cách:{" "}
          {routeData.estimatedDistance < 1
            ? `${(routeData.estimatedDistance * 1000).toFixed(0)} m`
            : `${routeData.estimatedDistance.toFixed(1)} km`}
        </Text>
        <Text style={styles.infoText}>
          Ước tính: {routeData.estimatedTime} phút
        </Text>
      </View>

      <TouchableOpacity
        style={styles.driverInfoContainer}
        onPress={toggleModal}
      >
        <TouchableOpacity style={styles.driverDetails}>
          <Image
            source={{ uri: driverDetails.avatar }}
            style={styles.driverAvatar}
          />
          <View style={styles.driverTextContainer}>
            <Text style={styles.driverName}>
              {driverDetails.name || "Driver Name"}
            </Text>
            <Text style={styles.vehiclePlate}>
              {driverDetails.vehiclePlate || "Vehicle Plate"}
            </Text>
            <Text style={styles.vehiclePlate}>Air Balde 2020 150cc </Text>
            <Text style={styles.driverPhone}>
              SĐT: {driverDetails.phoneNumber || "Unavailable"}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
          <Ionicons name="chatbubble-outline" size={24} color="black" />
          <Text style={styles.chatText}>Liên hệ với tài xế</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancel1Button} onPress={toggleModal}>
          <Ionicons name="close-circle" size={24} color="black" />
          <Text style={styles.chatText}>Hủy chuyến</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Ionicons
                name="information-circle-outline"
                size={50}
                color="#4CAF50"
              />
              <Text style={styles.modalTitle}>Chi tiết chuyến đi</Text>

              {/* Thông tin điểm đón */}
              <View style={styles.modalInfoRow}>
                <Ionicons name="location-outline" size={20} color="#333" />
                <Text style={styles.modalInfoText}>
                  Điểm đón: {pickupLocation.address}
                </Text>
              </View>

              {/* Thông tin điểm đến */}
              <View style={styles.modalInfoRow}>
                <Ionicons name="flag-outline" size={20} color="#333" />
                <Text style={styles.modalInfoText}>
                  Điểm đến: {destination.address}
                </Text>
              </View>

              {/* Thông tin tài xế */}
              <View style={styles.modalInfoRow}>
                <Ionicons name="person-circle-outline" size={20} color="#333" />
                <Text style={styles.modalInfoText}>
                  Tài xế: {driverDetails.name}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Ionicons name="car-outline" size={20} color="#333" />
                <Text style={styles.modalInfoText}>
                  Biển số: {driverDetails.vehiclePlate}
                </Text>
              </View>

              {/* Nút hủy chuyến đi */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelRide}
              >
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.cancelText}>Hủy chuyến đi</Text>
              </TouchableOpacity>

              {/* Nút đóng modal */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleModal}
              >
                <Ionicons name="close-outline" size={20} color="#333" />
                <Text style={styles.closeText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#333" },
  backButtonContainer: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 2,
  },
  backButton: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 50,
    elevation: 3,
  },
  infoContainer: {
    position: "absolute",
    top: 70,
    left: 10,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 5,
  },
  infoText: { fontSize: 14, fontWeight: "bold" },
  driverInfoContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  driverDetails: { flexDirection: "row", alignItems: "center" },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  driverTextContainer: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  vehiclePlate: { fontSize: 14, color: "#666" },
  driverPhone: { fontSize: 14, color: "#333", marginTop: 4 },
  driverStatus: {
    fontSize: 14,
    color: "red",
    marginTop: 4,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#E0F7FA",
    padding: 10,
    borderRadius: 10,
  },
  cancel1Button: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#E0F7FA",
    padding: 10,
    borderRadius: 10,
  },
  chatText: { marginLeft: 5, fontSize: 14, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  modalInfoText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#555",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5722",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  closeText: {
    color: "#333",
    fontSize: 16,
    marginLeft: 5,
  },
});

export default RideTrackingScreen;
