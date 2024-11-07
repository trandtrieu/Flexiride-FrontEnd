import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { IP_ADDRESS } from "@env";

const RideTrackingScreen = ({ route, navigation }) => {
  const { requestId, driverId } = route.params;
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverDetails, setDriverDetails] = useState({});

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await axios.get(
          `http://${IP_ADDRESS}:3000/booking-traditional/request/${requestId}`
        );
        if (response.data) {
          console.log("Request Details:", response.data);

          setPickupLocation({
            latitude: response.data.latitude_from,
            longitude: response.data.longitude_from,
          });
          setDropoffLocation({
            latitude: response.data.latitude_to,
            longitude: response.data.longitude_to,
          });
        }
      } catch (error) {
        console.error("Error fetching request details:", error);
      }
    };

    const fetchDriverLocation = async () => {
      try {
        const response = await axios.get(
          `http://${IP_ADDRESS}:3000/booking-traditional/location/driver/${driverId}`
        );
        if (response.data && response.data.location) {
          console.log("Driver Location Data:", response.data);

          setDriverLocation({
            latitude: response.data.location.coordinates[1],
            longitude: response.data.location.coordinates[0],
          });
          setDriverDetails(response.data.driverDetails);
        }
      } catch (error) {
        console.error("Error fetching driver location:", error);
      }
    };

    fetchRequestDetails();
    fetchDriverLocation();
  }, [requestId, driverId]);

  if (!pickupLocation || !dropoffLocation || !driverLocation) {
    return <Text>Loading...</Text>;
  }
  const handleChat = () => {
    navigation.navigate("ChatScreenCustomer", {
      userId: "670bdfc8b65786a7225f39a1", // Replace this with the actual user ID
      role: "customer", // or "driver" based on the user's role
      driverId: "6720c996743774e812904a02", // Replace this with the ID of the driver or customer
      roomId: "1245",
    });
  };

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
        <Marker coordinate={dropoffLocation} title="Drop-off Location" />
        <Marker coordinate={driverLocation} title="Driver" pinColor="blue">
          <Image source={{ uri: driverDetails.avatar }} style={styles.avatar} />
        </Marker>
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
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => handleChat()} // Calls handleChat on press
          >
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
