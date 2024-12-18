import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { VIETMAP_API_KEY } from "@env";

const MapScreen = ({ navigation, route }) => {
  const { pickupLocation, destinationLocation, onSelectPickupLocation } =
    route.params;
  const [selectedPickupLocation, setSelectedPickupLocation] =
    useState(pickupLocation);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchNearbyPlaces(pickupLocation.latitude, pickupLocation.longitude);
  }, [pickupLocation]);

  const fetchAddressFromCoordinates = async (latitude, longitude) => {
    console.log("work codi ");
    const url = `https://maps.vietmap.vn/api/reverse/v3?apikey=${VIETMAP_API_KEY}&lat=${latitude}&lng=${longitude}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.length > 0) {
        return {
          address: data[0].address,
          name: data[0].name || "Unknown Place",
        };
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
    return {
      address: "Unknown Address",
      name: "Unknown Place",
    };
  };

  const fetchNearbyPlaces = async (latitude, longitude) => {
    const radius = 500; // Bán kính tìm kiếm 500 mét
    const url = `https://maps.vietmap.vn/api/search/v3?apikey=${VIETMAP_API_KEY}&text=*&focus=${latitude},${longitude}&circle_center=${latitude},${longitude}&circle_radius=${radius}&size=10`;

    setLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        setNearbyPlaces(data);
      } else {
        console.log("Không có địa điểm gần đó.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy các vị trí gần đó:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChangeComplete = async (newRegion) => {
    setLoading(true);
    const locationData = await fetchAddressFromCoordinates(
      newRegion.latitude,
      newRegion.longitude
    );
    setSelectedPickupLocation({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
      name: locationData.name,
      address: locationData.address,
    });
    setLoading(false);
  };

  const handleConfirmLocation = () => {
    navigation.navigate("RouteScreen", {
      pickupLocation: selectedPickupLocation,
      destinationLocation: destinationLocation,
    });
  };
  const handleBack = () => {
    onSelectPickupLocation(selectedPickupLocation);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons
          name="arrow-back"
          type="ionicon"
          size={25}
          onPress={handleBack}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Đón tại?"
          value={selectedPickupLocation.name}
          editable={false}
        />
      </View>

      {/* Bản đồ */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
      >
        <Marker
          coordinate={{
            latitude: selectedPickupLocation.latitude,
            longitude: selectedPickupLocation.longitude,
          }}
          title="Điểm đón"
          pinColor="green"
        />
      </MapView>

      {/* Danh sách địa điểm gợi ý */}
      <View style={styles.bottomPanel}>
        <ScrollView style={styles.suggestionsList}>
          {nearbyPlaces.map((place, index) => (
            <View key={index} style={styles.locationItem}>
              <Ionicons name="location" type="ionicon" size={20} />
              <View style={styles.locationTextWrapper}>
                <Text style={styles.locationName}>{place.name}</Text>
                <Text style={styles.locationAddress}>{place.address}</Text>
              </View>
              <Text style={styles.locationDistance}>
                {place.distance
                  ? `${(place.distance * 1000).toFixed(0)} m`
                  : "0 m"}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Nút xác nhận */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmLocation}
          disabled={loading} // Disable button khi đang lấy dữ liệu
        >
          <Text style={styles.confirmButtonText}>
            {loading ? "Đang tải..." : "Chọn điểm đón này"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    elevation: 2,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },
  map: {
    flex: 4, // Bản đồ chiếm phần lớn không gian
  },
  bottomPanel: {
    flex: 2, // Giới hạn chiều cao của bottom panel
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 3,
  },
  suggestionsList: {
    flexShrink: 1, // Để ScrollView không chiếm quá nhiều không gian
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  locationTextWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  locationName: {
    fontWeight: "bold",
  },
  locationAddress: {
    color: "#555",
  },
  locationDistance: {
    color: "#555",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MapScreen;
