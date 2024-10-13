import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Alert,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import { TouchableWithoutFeedback } from "react-native";
import * as Location from "expo-location";

const LocationPicker = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("recent");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isPickupFocused, setIsPickupFocused] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    getCurrentLocation();
  }, []);
  const fetchPlacePredictions = async (input) => {
    if (!currentLocation) {
      console.log("Vị trí hiện tại không có sẵn");
      return [];
    }

    const { latitude, longitude } = currentLocation;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apiKey}&language=vi&location=${latitude},${longitude}&radius=5000`;

    setLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();
      const predictionsWithDistance = await Promise.all(
        data.predictions.map(async (prediction) => {
          const location = await fetchPlaceDetails(prediction.place_id);
          if (location) {
            const distance = calculateDistance(
              latitude,
              longitude,
              location.lat,
              location.lng
            );
            return { ...prediction, distance }; // Gán thêm khoảng cách vào prediction
          }
          return prediction;
        })
      );
      return predictionsWithDistance;
    } catch (error) {
      console.error("Error fetching place predictions:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const location = data.result.geometry.location;
      return location;
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Bán kính trái đất tính bằng km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const handlePickupChange = async (text) => {
    setPickup(text);
    setIsPickupFocused(true);
    if (text.length > 1) {
      const results = await fetchPlacePredictions(text);
      setPredictions(results);
    } else {
      setPredictions([]);
    }
  };

  const handleDestinationChange = async (text) => {
    setDestination(text);
    setIsPickupFocused(false);
    if (text.length > 1) {
      const results = await fetchPlacePredictions(text);
      setPredictions(results);
    } else {
      setPredictions([]);
    }
  };

  const handlePredictionSelect = (prediction) => {
    if (isPickupFocused) {
      setPickup(prediction.structured_formatting.main_text);
    } else {
      setDestination(prediction.structured_formatting.main_text);
    }
    setPredictions([]);
  };

  const handleSelectFromMap = () => {
    navigation.navigate("MapScreen", {
      onSelectLocations: (pickupString, destinationString) => {
        setPickup(pickupString);
        setDestination(destinationString);
      },
    });
  };

  const fetchAddressFromCoordinates = async (latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setPickup(address);
      } else {
        console.log("Không tìm thấy địa chỉ");
      }
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ từ tọa độ:", error);
    }
  };

  const fetchNearbyPlaces = async (latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=500&key=${apiKey}`;
    setLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results) {
        setNearbyPlaces(data.results);
        setSelectedTab("suggested");
      } else {
        console.log("Không tìm thấy địa điểm gần đó.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API Nearby Places:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập vị trí bị từ chối",
          "Ứng dụng cần quyền truy cập vị trí để lấy điểm đón hiện tại."
        );
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      await fetchAddressFromCoordinates(latitude, longitude);
      await fetchNearbyPlaces(latitude, longitude);
    } catch (error) {
      console.error("Error getting location", error);
    } finally {
      setLoading(false);
    }
  };
  const handleInputClear = (field) => {
    if (field === "pickup") {
      setPickup("");
    } else if (field === "destination") {
      setDestination("");
    }
    setPredictions([]);
  };

  const handleNearbyPlaceSelect = (place) => {
    setPickup(place.name);
    setPredictions([]);
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
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Đón tại"
                value={pickup}
                onChangeText={handlePickupChange}
                onFocus={() => setIsPickupFocused(true)}
                multiline={false}
                scrollEnabled={false}
                textAlign="left"
              />

              {pickup ? (
                <Icon
                  name="close-circle"
                  type="ionicon"
                  size={20}
                  onPress={() => handleInputClear("pickup")}
                  style={styles.clearIcon}
                />
              ) : null}
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Đến đâu?"
                value={destination}
                onChangeText={handleDestinationChange}
                onFocus={() => setIsPickupFocused(false)}
                textAlign="left"
              />
              {destination ? (
                <Icon
                  name="close-circle"
                  type="ionicon"
                  size={20}
                  onPress={() => handleInputClear("destination")}
                  style={styles.clearIcon}
                />
              ) : null}
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC323" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}

        {predictions.length > 0 ? (
          <ScrollView style={styles.locations}>
            {predictions.map((prediction, index) => (
              <TouchableOpacity
                key={index}
                style={styles.locationItem}
                onPress={() => handlePredictionSelect(prediction)}
              >
                <View style={styles.iconWrapper}>
                  <Icon
                    name="location"
                    type="ionicon"
                    size={24}
                    color="#FFC323"
                  />
                  {prediction.distance && (
                    <Text style={styles.locationDistance}>
                      {prediction.distance.toFixed(0)} km
                    </Text>
                  )}
                </View>
                <View style={styles.textWrapper}>
                  <Text style={styles.locationName}>
                    {prediction.structured_formatting.main_text}
                  </Text>
                  <Text style={styles.locationAddress}>
                    {prediction.structured_formatting.secondary_text}
                  </Text>
                </View>
                <Icon
                  name="dots-three-vertical"
                  type="entypo"
                  size={16}
                  color="#A9A9A9"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "recent" && styles.activeTab]}
              onPress={() => setSelectedTab("recent")}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "recent" && styles.activeTabText,
                ]}
              >
                Dùng gần đây
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === "suggested" && styles.activeTab,
              ]}
              onPress={() => setSelectedTab("suggested")}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "suggested" && styles.activeTabText,
                ]}
              >
                Đề xuất
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "saved" && styles.activeTab]}
              onPress={() => setSelectedTab("saved")}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "saved" && styles.activeTabText,
                ]}
              >
                Đã lưu
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedTab === "suggested" &&
          predictions.length === 0 &&
          isPickupFocused && (
            <>
              <TouchableOpacity style={styles.locationItem}>
                <Icon name="locate" type="ionicon" size={20} color="#4a4a4a" />
                <Button
                  title="Sử dụng vị trí hiện tại"
                  onPress={getCurrentLocation}
                  buttonStyle={styles.currentLocationBtn}
                  titleStyle={styles.currentLocationTitle}
                  loading={loading}
                />
              </TouchableOpacity>
              <ScrollView style={styles.locations}>
                {nearbyPlaces.map((place, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.locationItem}
                    onPress={() => handleNearbyPlaceSelect(place)}
                  >
                    <Icon
                      name="location"
                      type="ionicon"
                      size={20}
                      color="#4a4a4a"
                    />
                    <View style={styles.locationText}>
                      <Text style={styles.locationName}>{place.name}</Text>
                      <Text style={styles.locationAddress}>
                        {place.vicinity}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

        <View style={styles.footer}>
          <Button
            title="Chọn từ bản đồ"
            onPress={handleSelectFromMap}
            buttonStyle={styles.btnMap}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#d9d9d9",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 8,
    textAlign: "left",
    paddingRight: 10,
  },
  clearIcon: {
    marginLeft: 10,
    padding: 5,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#FFC323",
  },
  tabText: {
    fontSize: 12,
    color: "#FFC323",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#FFC323",
  },
  locations: {
    flex: 1,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 10,
  },
  locationText: {
    marginLeft: 15,
  },
  locationName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 10,
    color: "black",
  },
  locationDistance: {
    fontSize: 10,
    color: "#A9A9A9",
    marginTop: 2,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textWrapper: { flex: 1, justifyContent: "center", fontSize: 20 },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: "#FFC323",
  },
  footer: {
    marginTop: "auto",
  },
  currentLocationBtn: {
    backgroundColor: "#fff",
    padding: 0,
    marginLeft: 15,
  },
  currentLocationTitle: {
    color: "black",
    fontSize: 13,
  },
  btnMap: {
    backgroundColor: "#FFC323",
  },
});

export default LocationPicker;
