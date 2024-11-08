import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import io from "socket.io-client";
import { IP_ADDRESS, VIETMAP_API_KEY } from "@env";
import polyline from "@mapbox/polyline";

const RideTrackingScreen = ({ route, navigation }) => {
  const { requestId, driverId } = route.params;
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverDetails, setDriverDetails] = useState({});
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const socket = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const requestResponse = await axios.get(
          `http://${IP_ADDRESS}:3000/booking-traditional/request/${requestId}`
        );

        if (requestResponse.data) {
          setPickupLocation({
            latitude: requestResponse.data.latitude_from,
            longitude: requestResponse.data.longitude_from,
          });
          setDropoffLocation({
            latitude: requestResponse.data.latitude_to,
            longitude: requestResponse.data.longitude_to,
          });
        }

        const driverResponse = await axios.get(
          `http://${IP_ADDRESS}:3000/booking-traditional/location/driver/${driverId}`
        );

        if (driverResponse.data && driverResponse.data.location) {
          setDriverLocation({
            latitude: driverResponse.data.location.coordinates[1],
            longitude: driverResponse.data.location.coordinates[0],
          });
          setDriverDetails(driverResponse.data.driverDetails);

          // Vẽ tuyến đường từ tài xế đến khách hàng
          calculateRoute(
            driverResponse.data.location.coordinates[1],
            driverResponse.data.location.coordinates[0]
          );
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();

    // Sử dụng WebSocket để nhận cập nhật vị trí theo thời gian thực
    socket.current = io(`http://${IP_ADDRESS}:3000`, {
      transports: ["websocket"],
      query: { driverId },
    });

    socket.current.on("updateDriverLocation", (newLocation) => {
      setDriverLocation({
        latitude: newLocation.coordinates[1],
        longitude: newLocation.coordinates[0],
      });
      calculateRoute(newLocation.coordinates[1], newLocation.coordinates[0]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [requestId, driverId]);

  // Hàm tính toán và vẽ tuyến đường sử dụng Vietmap API
  const calculateRoute = async (driverLat, driverLng) => {
    if (!pickupLocation) return;

    try {
      console.log("api soute is running");
      const response = await axios.get(
        `https://maps.vietmap.vn/api/route?apikey=${VIETMAP_API_KEY}&point=${driverLat},${driverLng}&point=${pickupLocation.latitude},${pickupLocation.longitude}&vehicle=car&points_encoded=true`
      );

      if (response.data && response.data.paths.length > 0) {
        const decodedPoints = polyline.decode(response.data.paths[0].points);
        const coordinates = decodedPoints.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));
        setRouteCoordinates(coordinates);
      }
      console.log("🚀 ~ calculateRoute ~ coordinates:", routeCoordinates);
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  };
  16.01316200564292, 108.25569720860112;
  const handleChat = () => {
    navigation.navigate("ChatScreenCustomer", {
      userId: "670bdfc8b65786a7225f39a1",
      role: "customer",
      driverId,
      roomId: requestId,
    });
  };

  if (!pickupLocation || !dropoffLocation || !driverLocation) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={pickupLocation} title="Pickup Location" />
        <Marker
          coordinate={dropoffLocation}
          title="Drop-off Location"
          pinColor="blue"
        />
        <Marker coordinate={driverLocation} title="Driver" pinColor="yellow">
          <Ionicons name="navigate-circle" size={35} color="blue" />
        </Marker>
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="blue"
            strokeWidth={5}
          />
        )}
      </MapView>

      <View style={styles.driverInfoContainer}>
        <Text style={styles.statusText}>Tài xế sắp đến</Text>
        <Text style={styles.subStatusText}>
          Bến Xe Mỹ Đình - Cổng Nguyễn Hoàng
        </Text>
        <View style={styles.driverDetails}>
          <Image
            source={{ uri: driverDetails.avatar }}
            style={styles.driverAvatar}
          />
          <View style={styles.driverTextContainer}>
            <Text style={styles.driverName}>
              {driverDetails.name || "Driver Name"}
            </Text>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehiclePlate}>
                {driverDetails.vehiclePlate}
              </Text>
              <Text style={styles.vehicleModel}>Honda Dream</Text>
            </View>
            <Text style={styles.ratingText}>Rating: 5 ★</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={24} color="black" />
            <Text style={styles.actionText}>Chat với tài xế</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callButton}
            onPress={() => Alert.alert("Call Driver")}
          >
            <Ionicons name="call-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  driverInfoContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  subStatusText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  driverDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  driverTextContainer: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  vehiclePlate: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 5,
  },
  vehicleModel: {
    fontSize: 14,
    color: "#666",
  },
  ratingText: {
    fontSize: 14,
    color: "#FFC107",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F7FA",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
  },
  callButton: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export default RideTrackingScreen;
