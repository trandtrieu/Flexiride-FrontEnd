import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import * as Location from "expo-location";

const LocationComponent = ({ navigation }) => {
  const [location, setLocation] = useState(null);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  return (
    <View>
      <Button title="Get Current Location" onPress={getCurrentLocation} />
      {location && (
        <Text>
          Latitude: {location.coords.latitude}, Longitude:{" "}
          {location.coords.longitude}
        </Text>
      )}
    </View>
  );
};

export default LocationComponent;
