import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { VIETMAP_API_KEY } from "@env";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { ScrollView } from "react-native";
import { Icon } from "react-native-elements";

const RouteScreen = ({ route, navigation }) => {
  //   const { pickupLocation, destinationLocation } = route.params;

  const defaultPickupLocation = {
    latitude: 16.054407,
    longitude: 108.202167,
  };

  const defaultDestinationLocation = {
    latitude: 16.051588,
    longitude: 108.199971,
  };

  const {
    pickupLocation = defaultPickupLocation,
    destinationLocation = defaultDestinationLocation,
  } = route.params || {};
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    // calculateRoute();
  }, [pickupLocation, destinationLocation]);

  const calculateRoute = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://maps.vietmap.vn/api/route?apikey=${VIETMAP_API_KEY}&point=${pickupLocation.latitude},${pickupLocation.longitude}&point=${destinationLocation.latitude},${destinationLocation.longitude}&vehicle=car&points_encoded=true`
      );
      const { paths } = response.data;
      const decodedPoints = polyline.decode(paths[0].points);
      const coordinates = decodedPoints.map((point) => ({
        latitude: point[0],
        longitude: point[1],
      }));
      setRouteData(coordinates);

      // Auto zoom to fit the route on the map
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } catch (error) {
      console.error("Error calculating route: ", error);
    }
    setLoading(false);
  };
  const handleBackPress = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="arrow-back" type="ionicon" color="#000" size={25} />
        </TouchableOpacity>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {routeData && (
          <Polyline
            coordinates={routeData}
            strokeColor="#000"
            strokeWidth={6}
          />
        )}
      </MapView>
      <View style={styles.optionsContainer}>
        <ScrollView
          style={styles.rideOptions}
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.option}>
            <View style={styles.optionInfo}>
              <Image
                source={require("../assets/bike-icon.png")}
                style={styles.serviceIcon}
              />
              <Text style={styles.optionTitle}>FlexiBike</Text>
              <Icon
                name="user"
                type="font-awesome"
                style={styles.seatIcon}
                size={16}
                color={"#FFC323"}
              />
              <Text style={styles.optionSeats}>1</Text>
            </View>
            <View style={styles.optionPrice}>
              <Text style={styles.discountPrice}>44.000đ</Text>
              <Text style={styles.actualPrice}>33.000đ</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <View style={styles.optionInfo}>
              <Image
                source={require("../assets/car-icon.png")}
                style={styles.serviceIcon}
              />
              <Text style={styles.optionTitle}>FlexiCar</Text>
              <Icon
                name="user"
                type="font-awesome"
                style={styles.seatIcon}
                size={16}
                color={"#FFC323"}
              />
              <Text style={styles.optionSeats}>4</Text>
            </View>
            <View style={styles.optionPrice}>
              <Text style={styles.discountPrice}>42.000đ</Text>
              <Text style={styles.actualPrice}>32.000đ</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <View style={styles.optionInfo}>
              <Image
                source={require("../assets/car-icon.png")}
                style={styles.serviceIcon}
              />
              <Text style={styles.optionTitle}>FlexiCar</Text>
              <Icon
                name="user"
                type="font-awesome"
                style={styles.seatIcon}
                size={16}
                color={"#FFC323"}
              />
              <Text style={styles.optionSeats}> 7</Text>
            </View>
            <View style={styles.optionPrice}>
              <Text style={styles.discountPrice}>101.000đ</Text>
              <Text style={styles.actualPrice}>76.000đ</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Payment and Booking */}
        <View style={styles.paymentOptions}>
          <TouchableOpacity style={styles.bookNowButton}>
            <Text style={styles.bookNowText}>GrabNow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Đặt Xe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonContainer: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 2,
  },
  backButton: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 50,
    elevation: 3,
  },
  map: {
    flex: 3,
  },
  optionsContainer: {
    flex: 2,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  rideOptions: {
    flex: 1,
    marginBottom: 10,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  optionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  optionSeats: {
    marginLeft: 4,
    fontSize: 12,
    color: "#555",
  },
  seatIcon: {
    marginLeft: 10,
    fontSize: 8,
    color: "#555",
  },
  optionPrice: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  discountPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#888",
  },
  actualPrice: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  bookNowButton: {
    backgroundColor: "#E0F7FA",
    padding: 15,
    borderRadius: 40,
    marginRight: 10,
    flex: 1,
    alignItems: "center",
  },
  bookNowText: {
    color: "#00796B",
    fontSize: 16,
    fontWeight: "bold",
  },
  bookButton: {
    backgroundColor: "#00BFA5",
    padding: 15,
    borderRadius: 40,
    flex: 1,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  serviceIcon: {
    width: 40,
    height: 40,
  },
});

export default RouteScreen;
