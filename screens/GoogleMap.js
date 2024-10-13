import { Button, Dimensions, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import CustomMarker from "./CustomMarker";

export default function GoogleMap() {
  // Khởi tạo vị trí ban đầu (vị trí mặc định)
  const initialLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
  };

  // Trạng thái lưu trữ vị trí hiện tại và tọa độ của pin trên bản đồ
  const [myLocation, setMyLocation] = useState(initialLocation);
  const [pin, setPin] = useState({});
  const [region, setRegion] = useState({
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const mapRef = useRef(null);

  const local = {
    latitude: "37.78825",
    longitude: "-122.4324",
  };

  useEffect(() => {
    setPin(local);
    _getLocation(); // Lấy vị trí khi component được render
  }, []);

  const _getLocation = async () => {
    try {
      // Yêu cầu quyền truy cập vị trí
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      // Lấy vị trí hiện tại
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 5000, // thời gian chờ 5 giây
      });

      setMyLocation(location.coords);
    } catch (err) {
      console.warn("Failed to get location:", err.message);
    }
  };

  // Hàm focus bản đồ về vị trí hiện tại
  const focusOnLocation = () => {
    if (myLocation.latitude && myLocation.longitude) {
      const newRegion = {
        latitude: parseFloat(myLocation.latitude),
        longitude: parseFloat(myLocation.longitude),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000); // Điều khiển hoạt cảnh di chuyển đến vị trí hiện tại
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Bản đồ */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        ref={mapRef}
        provider="google"
      >
        {/* Hiển thị marker tại vị trí hiện tại */}
        {myLocation.latitude && myLocation.longitude && (
          <Marker
            coordinate={{
              latitude: myLocation.latitude,
              longitude: myLocation.longitude,
            }}
            title="My current location"
            description="I am here"
          />
        )}

        {/* Hiển thị Custom Marker tại vị trí hiện tại */}
        {myLocation.latitude && myLocation.longitude && (
          <CustomMarker
            coordinate={{
              latitude: myLocation.latitude,
              longitude: myLocation.longitude,
            }}
            title="My current location"
            image={require("../assets/icon.png")}
          />
        )}

        {/* Marker tại vị trí mặc định */}
        {pin.latitude && pin.longitude && (
          <Marker
            coordinate={{
              latitude: parseFloat(pin.latitude),
              longitude: parseFloat(pin.longitude),
            }}
            title="Default location"
            description="I am here"
          />
        )}
      </MapView>

      {/* Nút điều khiển để focus bản đồ vào vị trí hiện tại */}
      <View style={styles.buttonContainer}>
        <Button title="Get Location" onPress={focusOnLocation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },
});
