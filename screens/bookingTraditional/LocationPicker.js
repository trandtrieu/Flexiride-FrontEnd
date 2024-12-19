import React, { useState, useEffect, useCallback } from "react";
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
import { IP_ADDRESS, VIETMAP_API_KEY } from "@env";
import _ from "lodash";
import { Ionicons } from "@expo/vector-icons";

const LocationPicker = ({ navigation, route }) => {
  const [selectedTab, setSelectedTab] = useState("recent");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isPickupFocused, setIsPickupFocused] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const predictionCache = {};
  const nearbyPlacesCache = {};
  const [cityId, setCityId] = useState(null);

  let previousLocation = null;

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Lắng nghe sự kiện khi màn hình này được focus để cập nhật pickup
    const unsubscribe = navigation.addListener("focus", () => {
      if (route.params?.newPickupLocation) {
        // Nhận dữ liệu từ MapScreen
        setPickup(route.params.newPickupLocation);
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.newPickupLocation]);

  const fetchPlacePredictions = useCallback(
    _.debounce(async (input) => {
      if (input.length < 3) {
        setPredictions([]);
        return;
      }

      if (predictionCache[input]) {
        return predictionCache[input];
      }

      if (!currentLocation) {
        console.log("Vị trí hiện tại không có sẵn");
        return [];
      }

      const { latitude, longitude } = currentLocation;
      const url = `https://maps.vietmap.vn/api/autocomplete/v3?apikey=${VIETMAP_API_KEY}&text=${input}&focus=${latitude},${longitude}`;
      console.log("call api" + url);

      setLoading(true);

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        predictionCache[input] = data;

        if (!data || data.length === 0) {
          console.log("No predictions found");
          return [];
        }

        const predictionsWithDistance = await Promise.all(
          data.map(async (prediction) => {
            if (!prediction.ref_id) {
              return { ...prediction, distance: null };
            }

            // Fetch details using the ref_id to get lat/lng
            const locationDetails = await fetchPlaceDetails(prediction.ref_id);
            if (locationDetails && locationDetails.lat && locationDetails.lng) {
              const distance = calculateDistance(
                latitude,
                longitude,
                locationDetails.lat,
                locationDetails.lng
              );
              return {
                ...prediction,
                distance,
                lat: locationDetails.lat,
                lng: locationDetails.lng,
              };
            } else {
              return { ...prediction, distance: null };
            }
          })
        );

        setPredictions(predictionsWithDistance); // Cập nhật state với kết quả mới
      } catch (error) {
        console.error("Error fetching place predictions:", error);
        setPredictions([]); // Xử lý lỗi và làm rỗng kết quả dự đoán
      } finally {
        setLoading(false);
      }
    }, 2000), // Sử dụng debounce với thời gian chờ là 2 giây
    [currentLocation]
  );

  const fetchPlaceDetails = async (placeId) => {
    const url = `https://maps.vietmap.vn/api/place/v3?apikey=${VIETMAP_API_KEY}&refid=${placeId}`;
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.lat && data.lng) {
        return { lat: data.lat, lng: data.lng };
      } else {
        console.log(
          "No coordinates found in place details for ref_id:",
          placeId
        );
        return null;
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      console.log("Invalid coordinates for distance calculation.");
      return null;
    }

    const R = 6371;
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  const handlePickupChange = async (text) => {
    if (predictionCache[text]) {
      setPredictions(predictionCache[text]);
    } else {
      setPickup(text);
      setIsPickupFocused(true);
      fetchPlacePredictions(text);
    }
  };

  const handleDestinationChange = async (text) => {
    if (predictionCache[text]) {
      setPredictions(predictionCache[text]);
    } else {
      setDestination(text);
      setIsPickupFocused(false);
      fetchPlacePredictions(text);
    }
  };

  const handlePredictionSelect = (prediction) => {
    if (isPickupFocused) {
      console.log("Pickup location selected:", prediction);
      setPickup(prediction);
    } else {
      console.log("Destination location selected:", prediction);
      setDestination(prediction);
    }

    setPredictions([]);

    if (isPickupFocused && destination) {
      console.log("Navigating to MapScreen with:");
      console.log("Pickup:", {
        latitude: prediction.lat,
        longitude: prediction.lng,
        name: prediction.name,
        address: prediction.address,
      });
      console.log("Destination:", {
        latitude: destination.lat,
        longitude: destination.lng,
        name: destination.name,
        address: destination.address,
      });

      navigation.navigate("MapScreen", {
        pickupLocation: {
          latitude: prediction.lat,
          longitude: prediction.lng,
          name: prediction.name,
          address: prediction.address,
        },
        destinationLocation: {
          latitude: destination.lat,
          longitude: destination.lng,
          name: destination.name,
          address: destination.address,
        },
        onSelectPickupLocation: (newPickupLocation) => {
          console.log("New pickup location from MapScreen:", newPickupLocation);
          setPickup(newPickupLocation);
        },
      });
    } else if (!isPickupFocused && pickup) {
      console.log("Navigating to MapScreen with:");
      console.log("Pickup:", {
        latitude: pickup.lat,
        longitude: pickup.lng,
        name: pickup.name,
        address: pickup.address,
      });
      console.log("Destination:", {
        latitude: prediction.lat,
        longitude: prediction.lng,
        name: prediction.name,
        address: prediction.address,
      });

      navigation.navigate("MapScreen", {
        pickupLocation: {
          latitude: pickup.lat,
          longitude: pickup.lng,
          name: pickup.name,
          address: pickup.address,
        },
        destinationLocation: {
          latitude: prediction.lat,
          longitude: prediction.lng,
          name: prediction.name,
          address: prediction.address,
        },
        onSelectPickupLocation: (newPickupLocation) => {
          console.log("New pickup location from MapScreen:", newPickupLocation);
          setPickup(newPickupLocation);
        },
      });
    }
  };

  const fetchNearbyPlaces = async (latitude, longitude) => {
    const cacheKey = `${latitude},${longitude}`;
    if (nearbyPlacesCache[cacheKey]) {
      setNearbyPlaces(nearbyPlacesCache[cacheKey]);
      return;
    }
    const radius = 500;
    const size = 10;
    const url = `https://maps.vietmap.vn/api/search/v3?apikey=${VIETMAP_API_KEY}&text=*&focus=${latitude},${longitude}&circle_center=${latitude},${longitude}&circle_radius=${radius}&size=${size}`;

    setLoading(true);
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        nearbyPlacesCache[cacheKey] = data;

        const placesWithDistance = await Promise.all(
          data.map(async (place) => {
            let placeLat = place.lat;
            let placeLng = place.lng;

            if (!placeLat || !placeLng) {
              const placeDetails = await fetchPlaceDetails(place.ref_id);
              placeLat = placeDetails?.lat;
              placeLng = placeDetails?.lng;
            }

            if (placeLat && placeLng) {
              const distance = calculateDistance(
                latitude,
                longitude,
                placeLat,
                placeLng
              );
              return { ...place, distance, lat: placeLat, lng: placeLng };
            } else {
              return { ...place, distance: null };
            }
          })
        );

        setNearbyPlaces(placesWithDistance);
        setSelectedTab("suggested");
      } else {
        console.log("No nearby places found.");
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchCityId = async (latitude, longitude) => {
    const url = `https://maps.vietmap.vn/api/reverse/v3?apikey=${VIETMAP_API_KEY}&lat=${latitude}&lng=${longitude}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        const cityBoundary = data[0]?.boundaries?.find(
          (boundary) => boundary.type === 0 // Loại 0 là "Thành phố"
        );

        if (cityBoundary) {
          const cityId = cityBoundary.id;
          console.log("City ID:", cityId);
          return cityId;
        }
      }
      console.log("Không tìm thấy cityId.");
      return null;
    } catch (error) {
      console.error("Lỗi khi lấy cityId:", error);
      return null;
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập vị trí bị từ chối",
          "Ứng dụng cần quyền truy cập vị trí. Vui lòng kiểm tra cài đặt và cấp quyền.",
          [
            { text: "Hủy" },
            { text: "Mở cài đặt", onPress: () => Linking.openSettings() },
          ]
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const distance = previousLocation
        ? calculateDistance(
            previousLocation.latitude,
            previousLocation.longitude,
            latitude,
            longitude
          )
        : null;

      if (!previousLocation || distance > 0.5) {
        setCurrentLocation({ latitude, longitude });
        const cityId = await fetchCityId(latitude, longitude);
        if (cityId) {
          setCityId(cityId); // Lưu `cityId` vào state
        }
        await fetchNearbyPlaces(latitude, longitude);
        previousLocation = { latitude, longitude };
      }
    } catch (error) {
      console.error("Error getting location", error);
      Alert.alert(
        "Không thể lấy vị trí hiện tại",
        "Vui lòng kiểm tra cài đặt GPS hoặc nhập điểm đón thủ công.",
        [{ text: "OK" }]
      );
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons
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
                placeholder="Đón tôi tại"
                value={pickup ? pickup.name : ""}
                onChangeText={handlePickupChange}
                onFocus={() => setIsPickupFocused(true)}
                multiline={false}
                scrollEnabled={false}
                textAlign="left"
              />
              {pickup ? (
                <Ionicons
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
                value={destination ? destination.name : ""} // Hiển thị name nhưng lưu toàn bộ prediction
                onChangeText={handleDestinationChange}
                onFocus={() => setIsPickupFocused(false)}
                textAlign="left"
              />
              {destination ? (
                <Ionicons
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
                  <Ionicons
                    name="location"
                    type="ionicon"
                    size={24}
                    color="#FFC323"
                  />
                  <Text style={styles.locationDistance}>
                    {prediction.distance != null
                      ? `${prediction.distance.toFixed(1)} km`
                      : "N/A"}
                  </Text>
                </View>
                <View style={styles.textWrapper}>
                  <Text style={styles.locationName}>{prediction.name}</Text>
                  <Text style={styles.locationAddress}>
                    {prediction.address}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.tabs}>
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
          </View>
        )}

        {selectedTab === "suggested" &&
          predictions.length === 0 &&
          isPickupFocused && (
            <>
              <TouchableOpacity style={styles.locationItem}>
                <Ionicons
                  name="locate"
                  type="ionicon"
                  size={20}
                  color="#4a4a4a"
                />
                <Button
                  title="Sử dụng vị trí hiện tại"
                  onPress={getCurrentLocation}
                  buttonStyle={styles.currentLocationBtn}
                  titleStyle={styles.currentLocationTitle}
                  loading={loading}
                />
              </TouchableOpacity>
              <ScrollView style={styles.locations}>
                {nearbyPlaces.map((place, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.locationItem}
                      // onPress={() => handleNearbyPlaceSelect(place)}
                      onPress={() => handlePredictionSelect(place)}
                    >
                      <View style={styles.iconWrapper}>
                        <Ionicons
                          name="location"
                          type="ionicon"
                          size={24}
                          color="#FFC323"
                        />
                        <Text style={styles.locationDistance}>
                          {place.distance != null
                            ? `${(place.distance * 1000).toFixed(0)} m`
                            : "N/A"}
                        </Text>
                      </View>
                      <View style={styles.textWrapper}>
                        <Text style={styles.locationName}>{place.name}</Text>
                        <Text style={styles.locationAddress}>
                          {place.address}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

        {/* <View style={styles.footer}>
          <Button
            title="Chọn từ bản đồ"
            onPress={handleSelectFromMap}
            buttonStyle={styles.btnMap}
          />
        </View> */}
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
