import React from "react";
import { View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";

const TestMap = ({ navigation }) => {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <Marker
        coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
        title="Test Marker"
        description="This is a description"
      />
    </MapView>
  );
};

export default TestMap;
