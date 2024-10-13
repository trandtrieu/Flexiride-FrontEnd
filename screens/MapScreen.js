import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location"; // Import expo-location
import { Icon } from "react-native-elements";

const MapScreen = ({ navigation, route }) => {
  const [region, setRegion] = useState({
    latitude: 16.047079,
    longitude: 108.20623,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [isSelectingPickup, setIsSelectingPickup] = useState(true);
  const [searchText, setSearchText] = useState("");
  const mapRef = useRef(null);

  // Lấy vị trí hiện tại của người dùng
  useEffect(() => {
    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Quyền truy cập vị trí bị từ chối");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      // Lấy địa chỉ từ tọa độ
      fetchAddressFromCoordinates(latitude, longitude);
    };

    getCurrentLocation();
  }, []);

  const fetchAddressFromCoordinates = async (latitude, longitude) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    console.log("🚀 ~ fetchAddressFromCoordinates ~ apiKey:", apiKey);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setSearchText(address);
      } else {
        console.log("Không tìm thấy địa chỉ");
      }
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ từ tọa độ:", error);
    }
  };

  const handleRegionChangeComplete = async (newRegion) => {
    setRegion(newRegion);

    // Giới hạn số lần gọi API
    if (
      newRegion.latitude !== region.latitude ||
      newRegion.longitude !== region.longitude
    ) {
      fetchAddressFromCoordinates(newRegion.latitude, newRegion.longitude);
    }

    const selectedLocation = {
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
      name: searchText,
    };

    if (isSelectingPickup) {
      setPickupLocation(selectedLocation);
    } else {
      setDestinationLocation(selectedLocation);
    }
  };

  const handleConfirmLocations = () => {
    if (pickupLocation && destinationLocation) {
      const pickupString = `Đón tại: ${pickupLocation.name}`;
      const destinationString = `Điểm đến: ${destinationLocation.name}`;
      route.params.onSelectLocations(pickupString, destinationString);
      navigation.goBack();
    }
  };

  const clearInput = () => {
    setSearchText("");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon
            name="arrow-back"
            type="ionicon"
            style={styles.backButton}
            size={25}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={
                isSelectingPickup
                  ? "Nhập địa chỉ đón tại"
                  : "Nhập địa chỉ điểm đến"
              }
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
                <Icon name="close" size={20} color="#4a4a4a" />
              </TouchableOpacity>
            )}
            {/* <View style={styles.header}>
            <Text
              style={styles.searchInput}
              placeholder={"Nhập địa chỉ đón tại"}
            />
          </View> */}
          </View>
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={true}
        >
          {pickupLocation && (
            <Marker
              coordinate={{
                latitude: pickupLocation.latitude,
                longitude: pickupLocation.longitude,
              }}
              title="Vị trí đón"
              pinColor="green"
            />
          )}
          {destinationLocation && (
            <Marker
              coordinate={{
                latitude: destinationLocation.latitude,
                longitude: destinationLocation.longitude,
              }}
              title="Điểm đến"
              pinColor="red"
            />
          )}
        </MapView>

        <View pointerEvents="none" style={styles.centerMarkerContainer}>
          <Icon
            name="location"
            type="ionicon"
            size={40}
            color={isSelectingPickup ? "green" : "red"}
          />
        </View>

        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSelectingPickup(!isSelectingPickup)}
          >
            <Text style={styles.switchButtonText}>
              {isSelectingPickup ? "Chọn điểm đến" : "Chọn đón tại"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPanel}>
          <Text style={styles.addressTitle}>Tap Hóa Tứ Vang</Text>
          <Text style={styles.address}>
            Thanh Niên, X.Duy Hải, H.Duy Xuyên...
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleConfirmLocations}
          >
            <Text style={styles.buttonText}>Chọn điểm đón này</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
  },
  clearButton: {
    padding: 5,
  },
  map: {
    flex: 1,
    marginTop: 10,
  },
  centerMarkerContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -40,
    zIndex: 10,
  },
  switchContainer: {
    position: "absolute",
    bottom: 150,
    alignSelf: "center",
  },
  switchButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
  switchButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#FF5722",
    padding: 15,
    borderRadius: 5,
    position: "absolute",
    bottom: 80,
    left: "10%",
    right: "10%",
    elevation: 3,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  ottomPanel: {
    padding: 20,
    backgroundColor: "#fff",
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  address: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    marginTop: 20,
    backgroundColor: "green",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default MapScreen;
