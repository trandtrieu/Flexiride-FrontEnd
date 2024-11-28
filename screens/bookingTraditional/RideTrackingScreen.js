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
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import io from "socket.io-client";
import { IP_ADDRESS, VIETMAP_API_KEY } from "@env";
import polyline from "@mapbox/polyline";
import { useAuth } from "../../provider/AuthProvider";

// Utility Functions
const fetchRequestDetails = async (requestId) => {
  try {
    const response = await axios.get(
      `http://${IP_ADDRESS}:3000/booking-traditional/request/${requestId}`
    );
    if (response.data) {
      console.log("🚀 ~ fetchRequestDetails ~ response.data :", response.data);
      return {
        pickup: {
          latitude: response.data.latitude_from,
          longitude: response.data.longitude_from,
        },
        destination: {
          latitude: response.data.latitude_to,
          longitude: response.data.longitude_to,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching request details:", error);
    throw new Error("Unable to fetch request details.");
  }
};

const fetchDriverDetails = async (driverId) => {
  try {
    const response = await axios.get(
      `http://${IP_ADDRESS}:3000/booking-traditional/location/driver/${driverId}`
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
        estimatedDistance: distance / 1000, // Convert meters to kilometers
        estimatedTime: Math.ceil(time / 1000 / 60), // Convert milliseconds to minutes
      });
    } else {
      throw new Error("No route data available.");
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
  const [driverStatus, setDriverStatus] = useState("offline");
  const [routeData, setRouteData] = useState({
    coordinates: [],
    estimatedDistance: "",
    estimatedTime: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const socket = useRef(null);
  const { authState } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false); // State kiểm soát modal

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
        setDriverStatus(driver.status);

        await calculateRoute(driver.location, pickup, setRouteData);
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    socket.current = io(`http://${IP_ADDRESS}:3000`, {
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

  const handleCancelRide = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn hủy chuyến đi?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy chuyến",
          style: "destructive",
          onPress: () => {
            // Thực hiện API call để hủy chuyến đi
            axios
              .post(`http://${IP_ADDRESS}:3000/booking-traditional/cancel`, {
                requestId,
              })
              .then(() => {
                Alert.alert("Thành công", "Bạn đã hủy chuyến đi.");
                navigation.goBack();
              })
              .catch((error) => {
                Alert.alert(
                  "Lỗi",
                  "Không thể hủy chuyến đi. Vui lòng thử lại."
                );
              });
          },
        },
      ],
      { cancelable: true }
    );
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
        <Marker coordinate={pickupLocation} title="Điểm đón">
          <Image
            source={require("../../assets/pickup-icon.png")}
            style={{ width: 40, height: 40 }}
          />
        </Marker>
        <Marker coordinate={driverLocation} title="Tài xế">
          <Image
            source={require("../../assets/bike-icon.png")}
            style={{ width: 40, height: 40 }}
          />
        </Marker>
        <Marker coordinate={destination} title="Điểm đến">
          <Image
            source={require("../../assets/destination-icon.png")} // Replace with your destination icon path
            style={{ width: 40, height: 40 }}
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

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Khoảng:{" "}
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
            <Text style={styles.driverPhone}>
              SĐT: {driverDetails.phoneNumber || "Unavailable"}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
          <Ionicons name="chatbubble-outline" size={24} color="black" />
          <Text style={styles.chatText}>Liên hệ với tài xế</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chi tiết chuyến đi</Text>
              <Text>
                Điểm đón: {pickupLocation.latitude}, {pickupLocation.longitude}
              </Text>
              <Text>
                Điểm đến: {destination.latitude}, {destination.longitude}
              </Text>
              <Text>Tài xế: {driverDetails.name}</Text>
              <Text>Biển số: {driverDetails.vehiclePlate}</Text>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelRide}
              >
                <Text style={styles.cancelText}>Hủy chuyến đi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleModal}
              >
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
  infoContainer: {
    position: "absolute",
    top: 10,
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
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  closeText: {
    color: "#333",
  },
});

export default RideTrackingScreen;
