import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

const PickupLocationScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
          title="Pickup Location"
        />
      </MapView>
      <View style={styles.bottomPanel}>
        <Text style={styles.addressTitle}>Tap Hóa Tú Vàng</Text>
        <Text style={styles.address}>
          Thanh Niên, X.Duy Hải, H.Duy Xuyên...
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Chọn điểm đón này</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomPanel: {
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

export default PickupLocationScreen;
