import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import MapView, { Callout, Marker, Polyline } from "react-native-maps";
import { VIETMAP_API_KEY } from "@env";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { ScrollView } from "react-native";
import { Icon } from "react-native-elements";
import { formatCurrency } from "../utils/formatPrice";
import io from "socket.io-client";
const RouteScreen = ({ route, navigation }) => {
  const pickupLocation = {
    latitude: 16.011807933073875,
    longitude: 108.25719691474046,
    name: "Nhà Thờ Đức Bà",
    address: "01 Công Xã Paris, Bến Nghé, Quận 1, TP.HCM",
  };

  const destinationLocation = {
    latitude: 10.823099,
    longitude: 106.629664,
    name: "Sân bay Tân Sơn Nhất",
    address: "Trường Sơn, Phường 2, Tân Bình, TP.HCM",
  };

  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const [services, setServices] = useState([]);
  const [distance, setDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedServicePrice, setSelectedServicePrice] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const socket = useRef(null);
  const bookingTimeout = useRef(null);

  const images = {
    "bike-icon.png": require("../assets/bike-icon.png"),
    "car-icon.png": require("../assets/car-icon.png"),
  };

  useEffect(() => {
    // Thiết lập socket kết nối
    socket.current = io("http://192.168.88.142:3000", {
      transports: ["websocket"],
    });

    socket.current.on("rideAccepted", (data) => {
      clearTimeout(bookingTimeout.current);
      Alert.alert(
        "Yêu cầu được chấp nhận",
        `Tài xế ${data.driverId} đã nhận chuyến!`
      );
      setIsBooking(false);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    // calculateRoute();
    calculateDistanceAndTime(pickupLocation, destinationLocation);
    fetchServicesAndPrices();
  }, []);
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
      console.warn("running");
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
        `http://192.168.88.142:3000/booking-traditional/services-with-prices`,
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
  const calculateDistanceAndTime = (pickup, destination) => {
    const R = 6371; // Radius of the earth in km
    const dLat = toRad(destination.latitude - pickup.latitude);
    const dLon = toRad(destination.longitude - pickup.longitude);
    const lat1 = toRad(pickup.latitude);
    const lat2 = toRad(destination.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = R * c;

    setDistance(distanceInKm.toFixed(1));

    const averageSpeed = 40;

    const timeInHours = distanceInKm / averageSpeed;
    const timeInMinutes = timeInHours * 60;
    const hours = Math.floor(timeInHours);
    const minutes = Math.round(timeInMinutes % 60);

    if (hours >= 1) {
      setEstimatedTime(`${hours} giờ ${minutes} phút`);
    } else {
      setEstimatedTime(`${minutes} phút`);
    }
  };

  const toRad = (Value) => {
    return (Value * Math.PI) / 180;
  };

  const handleBookingRequest = () => {
    if (!selectedServiceId) {
      alert("Vui lòng chọn một dịch vụ trước khi đặt xe");
      return;
    }

    setIsBooking(true);
    socket.current.emit("customerRequest", {
      customerId: "670bdfc8b65786a7225f39a1",
      pickupLocation,
      destinationLocation,
      serviceId: selectedServiceId,
      price: selectedServicePrice,
    });

    // Đặt khoảng thời gian chờ phản hồi từ tài xế
    bookingTimeout.current = setTimeout(() => {
      setIsBooking(false);
      Alert.alert(
        "Không có tài xế khả dụng",
        "Hiện không có tài xế nào chấp nhận yêu cầu của bạn."
      );
    }, 5000);
  };

  const handleBookingRequest2 = async () => {
    if (!selectedServiceId) {
      alert("Vui lòng chọn một dịch vụ trước khi đặt xe");
      return;
    }

    setIsBooking(true); // Bắt đầu quá trình đặt xe
    try {
      const bookingResponse = await axios.post(
        "http://192.168.88.142:3000/booking-traditional/create",
        {
          account_id: "671663e2957fd498c071db5f",
          longitude_from: pickupLocation.longitude,
          latitude_from: pickupLocation.latitude,
          longitude_to: destinationLocation.longitude,
          latitude_to: destinationLocation.latitude,
          service_id: selectedServiceId,
          price: selectedServicePrice,
          departure: new Date().toISOString(),
        }
      );

      console.log("Booking created successfully:", bookingResponse.data);
      alert("Yêu cầu đặt xe đã được tạo thành công");

      // Quét các tài xế gần đó
      await scanNearbyDrivers();
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Đã xảy ra lỗi khi tạo yêu cầu đặt xe");
    } finally {
      setIsBooking(false); // Hoàn thành quá trình đặt xe
    }
  };

  const scanNearbyDrivers = async () => {
    try {
      const driversResponse = await axios.get(
        `http://192.168.88.142:3000/booking-traditional/drivers/nearby`,
        {
          params: {
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
            radius: 50000, // Bán kính tìm kiếm trong km
          },
        }
      );

      if (driversResponse.data.length > 0) {
        const nearestDriver = driversResponse.data[0]; // Lấy tài xế gần nhất (có thể cải tiến bằng thuật toán tìm tài xế gần nhất)
        alert(
          `Yêu cầu đặt xe đã được gửi đến tài xế gần nhất: ${nearestDriver.account_id}`
        );
      } else {
        alert("Hiện không có tài xế nào gần bạn.");
      }

      console.log("Nearby drivers:", driversResponse.data);
    } catch (error) {
      console.error("Error scanning for drivers:", error);
    }
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
          pinColor="green"
        >
          <Callout>
            <Text>{pickupLocation.name || "Pickup Location"}</Text>
            <Text>{pickupLocation.address || "Địa điểm đón"}</Text>
          </Callout>
        </Marker>

        <Marker
          coordinate={{
            latitude: destinationLocation.latitude,
            longitude: destinationLocation.longitude,
          }}
          pinColor="red"
        >
          <Callout>
            <Text>{destinationLocation.name || "Drop-off Location"}</Text>
            <Text>{destinationLocation.address || "Địa điểm đến"}</Text>
          </Callout>
        </Marker>

        {/* Route Path */}
        {routeData && (
          <Polyline
            coordinates={routeData}
            strokeColor="blue"
            strokeWidth={8}
          />
        )}
      </MapView>

      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>Khoảng cách: {distance} km</Text>
        <Text style={styles.infoText}>Thời gian ước tính: {estimatedTime}</Text>
      </View>
      <View style={styles.optionsContainer}>
        <ScrollView
          style={styles.rideOptions}
          showsHorizontalScrollIndicator={false}
        >
          {services.length === 0 ? (
            <ActivityIndicator size="large" color="#00ff00" />
          ) : (
            services.map((service) => (
              <TouchableOpacity
                key={service._id}
                style={[
                  styles.option,
                  service._id === selectedServiceId && styles.selectedOption, // Thêm style cho dịch vụ được chọn
                ]}
                onPress={() => {
                  setSelectedServiceId(service._id);
                  setSelectedServicePrice(service.calculatedFare);
                }}
              >
                <View style={styles.optionInfo}>
                  <Image
                    source={
                      images[service.image] || require("../assets/car-icon.png")
                    }
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
                  {service.calculatedFare
                    ? formatCurrency(service.calculatedFare)
                    : "Không có giá"}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Payment and Booking */}
        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookingRequest}
            disabled={isBooking} // Vô hiệu hóa nút khi đang đặt xe
          >
            {isBooking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.bookButtonText}>Đặt Xe</Text>
            )}
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
  selectedOption: {
    backgroundColor: "#e0f7fa", // Màu nền cho dịch vụ được chọn
    borderColor: "#00796B", // Đổi màu đường viền nếu muốn
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
    fontSize: 13,
    color: "#000",
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
  distanceContainer: {
    padding: 10,
    backgroundColor: "#ccc",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
  },
});

export default RouteScreen;
