import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { VIETMAP_API_KEY } from "@env";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { ScrollView } from "react-native";
import { Icon } from "react-native-elements";
import { formatCurrency } from "../utils/formatPrice";

const RouteScreen = ({ route, navigation }) => {
  const { pickupLocation, destinationLocation } = route.params;

  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const [services, setServices] = useState([]);
  const images = {
    "bike-icon.png": require("../assets/bike-icon.png"),
    "car-icon.png": require("../assets/car-icon.png"),
  };

  useEffect(() => {
    calculateRoute();
    fetchServicesAndPrices();
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

  const fetchServicesAndPrices = async () => {
    try {
      const response = await axios.get(
        `http://192.168.88.169:3000/booking-traditional/services-with-prices`,
        {
          params: {
            pickupLocation: `${pickupLocation.latitude},${pickupLocation.longitude}`,
            destinationLocation: `${destinationLocation.latitude},${destinationLocation.longitude}`,
            isAdvanceBooking: false, // Hoặc điều chỉnh dựa trên yêu cầu thực tế
            isBadWeather: false, // Hoặc điều chỉnh dựa trên điều kiện thời tiết
          },
        }
      );
      setServices(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching services and prices:", error);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };
  const formatCurrency = (amount) => {
    if (!amount) return "Không có giá";
    const numericAmount = parseInt(amount, 10);
    return numericAmount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
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
        <Marker
          coordinate={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
          }}
          title="Pickup Location"
          description={pickupLocation.address || "Pickup Location"}
          pinColor="green"
        />

        <Marker
          coordinate={{
            latitude: destinationLocation.latitude,
            longitude: destinationLocation.longitude,
          }}
          title="Drop-off Location"
          description={destinationLocation.address || "Drop-off Location"}
          pinColor="red"
        />

        {/* Route Path */}
        {routeData && (
          <Polyline
            coordinates={routeData}
            strokeColor="blue"
            strokeWidth={8}
          />
        )}
      </MapView>
      <View style={styles.optionsContainer}>
        <ScrollView
          style={styles.rideOptions}
          showsHorizontalScrollIndicator={false}
        >
          {services.length === 0 ? (
            <ActivityIndicator size="large" color="#00ff00" />
          ) : (
            services.map((service) => (
              <TouchableOpacity key={service._id} style={styles.option}>
                <View style={styles.optionInfo}>
                  <Image
                    source={
                      images[service.image] || require("../assets/car-icon.png")
                    } // Dùng fallback nếu không có hình ảnh
                    style={styles.serviceIcon}
                  />
                  <Text style={styles.optionTitle}>{service.name}</Text>
                  <Icon
                    name="user"
                    type="font-awesome"
                    style={styles.seatIcon}
                    size={16}
                    color={"#FFC323"}
                  />
                  <Text style={styles.optionSeats}>{service.seat}</Text>
                </View>

                <Text style={styles.actualPrice}>
                  {service.calculatedFare !== null &&
                  service.calculatedFare !== undefined
                    ? formatCurrency(service.calculatedFare)
                    : "Không có giá"}
                </Text>
              </TouchableOpacity>
            ))
          )}
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
