import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/MaterialIcons";
import { debounce } from "lodash";

const { width, height } = Dimensions.get("window");

// Thay thế bằng API key thực tế của bạn
const GOOGLE_PLACES_API_KEY = "AIzaSyA4jwyF9rUD7yFlI0rIyX-iene3uNFTlbI";

const SearchScreen = ({ navigation }) => {
  const [pickUpLocation, setPickUpLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [distance, setDistance] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [region, setRegion] = useState({
    latitude: 16.0544,
    longitude: 108.2022,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to use this feature."
        );
        return;
      }
      getCurrentLocation();
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert("Error", "Failed to request location permission.");
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      setPickupCoordinates({ latitude, longitude }); // Đặt vị trí pickup mặc định
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Error", "Failed to get current location.");
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (text) => {
      if (text.length > 2) {
        setLoading(true);
        try {
          const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_PLACES_API_KEY}&input=${text}&location=${region.latitude},${region.longitude}&radius=50000&types=establishment`;
          const result = await fetch(apiUrl);
          const json = await result.json();
          if (json.status === "OK") {
            setPredictions(json.predictions.slice(0, 5)); // Giới hạn 5 dự đoán
          } else {
            console.warn("API returned non-OK status:", json.status);
            setPredictions([]);
          }
        } catch (e) {
          console.error("Fetch Error:", e);
          setPredictions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setPredictions([]);
      }
    }, 200),
    [region]
  );

  const onChangePickUpLocation = useCallback(
    (text) => {
      setPickUpLocation(text);
      setActiveInput("pickup");
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  const onChangeDestination = useCallback(
    (text) => {
      setDestination(text);
      setActiveInput("destination");
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  const onSelectPlace = useCallback(async (placeId) => {
    setLoading(true);
    try {
      const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry&key=${GOOGLE_PLACES_API_KEY}`;
      const result = await fetch(apiUrl);
      const json = await result.json();

      if (json.result) {
        const { lat, lng } = json.result.geometry.location;
        const selectedLocation = {
          latitude: lat,
          longitude: lng,
        };

        setPickupCoordinates(selectedLocation); // Cập nhật vị trí pickup
        setRegion({
          ...selectedLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setPickUpLocation(json.result.name);
        setPredictions([]);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      Alert.alert("Error", "Unable to fetch place details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMarkerDragEnd = (event) => {
    const newCoordinate = event.nativeEvent.coordinate;
    setPickupCoordinates(newCoordinate);
    setRegion({
      ...region,
      latitude: newCoordinate.latitude,
      longitude: newCoordinate.longitude,
    });
    setPickUpLocation("Picked up at this location"); // Tùy chọn: lấy tên địa điểm dựa trên tọa độ
  };

  const renderPrediction = ({ item }) => (
    <TouchableOpacity
      style={styles.prediction}
      onPress={() => onSelectPlace(item.place_id)}
    >
      <Icon name="place" size={20} color="#888" />
      <Text style={styles.predictionText}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        <View style={styles.inputContainer}>
          <Icon name="search" size={24} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Đón tại?"
            value={pickUpLocation}
            onChangeText={onChangePickUpLocation}
            onFocus={() => setActiveInput("pickup")}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="location-on" size={24} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Đến đâu?"
            value={destination}
            onChangeText={onChangeDestination}
            onFocus={() => setActiveInput("destination")}
          />
        </View>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#FF6347"
          style={{ marginTop: 20 }}
        />
      )}

      {predictions.length > 0 && (
        <FlatList
          data={predictions}
          renderItem={renderPrediction}
          keyExtractor={(item) => item.place_id}
          style={styles.predictionsList}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
        />
      )}

      <MapView style={styles.map} region={region} showsUserLocation={true}>
        {currentLocation && (
          <Marker coordinate={currentLocation} title="Your Location" />
        )}
        {pickupCoordinates && (
          <Marker
            coordinate={pickupCoordinates}
            title="Pickup Location"
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </MapView>

      <View style={styles.detailsContainer}>
        {pickUpLocation ? (
          <Text style={styles.locationText}>{pickUpLocation}</Text>
        ) : (
          <Text style={styles.locationText}>Chưa chọn địa điểm</Text>
        )}

        <TouchableOpacity style={styles.addDetailsButton}>
          <Text style={styles.addDetailsText}>
            Thêm chi tiết (ví dụ: gần cổng chính)
          </Text>
          <Icon name="add" size={20} color="#FF6347" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputsContainer: {
    padding: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    color: "#333",
  },
  map: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: "white",
  },
  locationText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  addDetailsText: {
    fontSize: 16,
    color: "#FF6347",
    marginRight: 5,
  },
  confirmButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  predictionsList: {
    maxHeight: height * 0.3,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    margin: 10,
    zIndex: 1,
  },
  prediction: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
  },
  predictionText: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default SearchScreen;
