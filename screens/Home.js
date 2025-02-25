import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl, // Import RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "./layouts/BottomNavigation";
import ServiceIcons from "./layouts/ServiceIcons";
import { useAuth } from "../provider/AuthProvider";
import { IP_ADDRESS } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { getPersonalNotification } from "../service/CommonServiceApi";
import { useFocusEffect } from "@react-navigation/native";
import { VIETMAP_API_KEY } from "@env";
import Geolocation from "@react-native-community/geolocation";
import useLocation from "../hook/useLocation";
import Swiper from "react-native-swiper";
const Home = ({ navigation }) => {
  const { authState } = useAuth();
  const [activeRide, setActiveRide] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [request, setRequest] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("Đại học FPT");
  const { currentLocation, getOneTimeLocation } = useLocation();

  const fetchCurrentLocation = async () => {
    try {
      Geolocation.getCurrentPosition(
        async (position) => {
          const radius = 500;
          const size = 10;
          // Gọi API VietMap Geocode
          const response = await axios.get(
            `https://maps.vietmap.vn/api/search/v3?apikey=${VIETMAP_API_KEY}&text=*&focus=${currentLocation.latitude},${currentLocation.longitude}&circle_center=${currentLocation.latitude},${currentLocation.longitude}&circle_radius=${radius}&size=${size}`
          );
          console.log(response.data);
          if (response.data && response.data[0]) {
            setCurrentAddress(response.data[0].name); // Hiển thị địa chỉ
          } else {
            setCurrentAddress("Không tìm thấy địa chỉ.");
          }
        },
        (error) => {
          console.error("Error fetching location: ", error);
          setCurrentAddress("Không thể lấy vị trí.");
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } catch (error) {
      console.error("Error calling Geocode API: ", error);
      setCurrentAddress("Không thể lấy địa chỉ.");
    }
  };

  // Lấy vị trí khi component được render
  // useEffect(() => {
  //   fetchCurrentLocation();
  // }, []);
  useFocusEffect(
    React.useCallback(() => {
      console.log("current location: ", currentLocation);
      fetchCurrentLocation();
    }, [])
  );
  // Load thông tin chuyến đi từ AsyncStorage
  const loadActiveRide = async () => {
    try {
      const ride = await AsyncStorage.getItem("activeRide");
      if (ride) {
        const parsedRide = JSON.parse(ride);
        setActiveRide(parsedRide);
        console.log("Active Ride:", parsedRide);
      }
    } catch (error) {
      console.error("Error loading active ride:  ", error);
    }
  };
  // useEffect(() => {
  //   const clearActiveBooking = async () => {
  //     try {
  //       await AsyncStorage.removeItem("activeRide");
  //       console.log("Active booking cleared successfully!");
  //     } catch (error) {
  //       console.error("Failed to clear active booking:", error);
  //     }
  //   };

  //   // Gọi hàm để xóa
  //   clearActiveBooking();
  // }, []);
  const fetchNotifications = async () => {
    try {
      const response = await getPersonalNotification(authState.token);

      if (response.data && Array.isArray(response.data.notifications)) {
        const unreadNotifications = response.data.notifications.filter(
          (notification) => !notification.readBy.includes(response.data.userId)
        );
        setNotifications(response.data.notifications);
        setUnreadCount(unreadNotifications.length);
      } else {
        console.error("Không có thông báo hoặc dữ liệu không hợp lệ.");
      }
    } catch (error) {
      // console.error("Error fetching notifications:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadActiveRide();
      fetchNotifications();
    }, [])
  );

  useEffect(() => {
    if (!activeRide?.requestId || request?.requestId === activeRide.requestId) {
      return; // Không gọi API nếu không có thay đổi
    }

    const fetchRequestDetail = async (requestId) => {
      try {
        const response = await axios.get(
          `https://flexiride.onrender.com/booking-traditional/request/${requestId}`
        );

        if (response.data) {
          setRequest(response.data);

          if (response.data.status === "completed") {
            await AsyncStorage.removeItem("activeRide");
            setActiveRide(null);
          } else if (response.data.status === "canceled") {
            setActiveRide(null);
            await AsyncStorage.removeItem("activeRide");
          }
        } else {
          Alert.alert(
            "Lỗi",
            "Không tìm thấy yêu cầu nào khớp với thời gian đã chọn."
          );
        }
      } catch (error) {
        console.error("Error fetching request details:", error);
        Alert.alert("Lỗi", "Không thể lấy thông tin yêu cầu");
      }
    };

    fetchRequestDetail(activeRide.requestId);
  }, [activeRide, request]);
  useEffect(() => {
    const fetchDriverLocation = async () => {
      if (activeRide?.driverId) {
        try {
          const response = await axios.get(
            `https://flexiride.onrender.com/booking-traditional/location/driver/${activeRide.driverId}`
          );
          if (response.data && response.data.location) {
            setDriverDetails(response.data.driverDetails);
          }
        } catch (error) {
          console.error("Error fetching driver location:", error);
        }
      }
    };
    fetchDriverLocation();
  }, [activeRide]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadActiveRide()]);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const navigateToManageNotifications = () => {
    navigation.navigate("ManageNotifications", { notifications });
  };

  const navigateToRide = () => {
    if (activeRide) {
      navigation.navigate("RideTrackingScreen", {
        requestId: activeRide.requestId,
        driverId: activeRide.driverId,
      });
    }
  };
  // slider
  const banners = [
    require("../assets/banner-long.png"),
    require("../assets/banner-long2.png"), // Thêm ảnh khác
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Text style={styles.text}>Đón bạn tại</Text>
            <TouchableOpacity>
              <Text style={styles.locationText}>{currentAddress}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={navigateToManageNotifications}
          >
            <Ionicons name="notifications-outline" size={30} color="black" />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {isRefreshing && (
          <View style={{ alignItems: "center", marginVertical: 10 }}>
            <Ionicons name="reload-outline" size={24} color="blue" />
            <Text>Đang làm mới...</Text>
          </View>
        )}

        <ServiceIcons />

        <View style={styles.bookNowContainer}>
          <Text style={styles.bookNowTitle}>ĐẶT XE  -- NHẬN NGAY ƯU ĐÃI</Text>
          <Ionicons name="arrow-forward-outline" size={24} color="black" />
        </View>

        <View style={styles.promotionsContainerSlider}>
          {/* Slider Section */}
          <Swiper
            style={{ height: 120 }}
            autoplay
            loop
          >
            {banners.map((banner, index) => (
              <View key={index} style={styles.promotionItemBaner}>
                <Image source={banner} style={styles.promotionImage} />
              </View>
            ))}
          </Swiper>
        </View>

        <View style={styles.promotionsContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ServiceSelection")}
            style={styles.promotionItem}>
            <Image
              source={require("../assets/cm3.png")}
              style={styles.promotionImage}
            />
            <Text style={styles.promotionText}>
              Tết Đoàn Viên, giảm ngay 200K
            </Text>
            <Text style={styles.promotionDate}>Đến hết 25/01</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("LocationPicker")}
            style={styles.promotionItem}>
            <Image
              source={require("../assets/cm2.png")}
              style={styles.promotionImage}
            />
            <Text style={styles.promotionText}>
              Giáng sinh an lành, ưu đãi chục cành!!
            </Text>
            <Text style={styles.promotionDate}>Đến hết 25/12</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.promotionsContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("LocationPicker")}
            style={styles.promotionItem}>
            <Image
              source={require("../assets/cm4.png")}
              style={styles.promotionImage}
            />
            <Text style={styles.promotionText}>
              Ăn chơi hết sẩy, FRide đưa về!
            </Text>
            <Text style={styles.promotionDate}>Đến hết 25/01</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("HireLocationPicker")}
            style={styles.promotionItem}>
            <Image
              source={require("../assets/cm1.png")}
              style={styles.promotionImage}
            />
            <Text style={styles.promotionText}>
              Thuê tài xế, Ưu đãi cực sốc!
            </Text>
            <Text style={styles.promotionDate}>Đến hết 22/12</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {activeRide && (
        <TouchableOpacity
          style={styles.activeRideContainer}
          onPress={navigateToRide}
        >
          <View style={styles.activeRideContent}>
            <Image
              source={
                driverDetails?.avatar
                  ? { uri: driverDetails.avatar }
                  : require("../assets/right_selfie.png")
              }
              style={styles.activeRideImage}
            />
            <View>
              <Text style={styles.activeRideText}>
                Tài xế: {driverDetails?.name || "Không rõ"}
              </Text>
              <Text style={styles.activeRideSubText}>
                Xe: {driverDetails?.vehiclePlate || "Không rõ"}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </TouchableOpacity>
      )}
      <BottomNavigation navigation={navigation} />
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  notificationButton: {
    position: "relative",
    marginLeft: 10,
  },
  unreadBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadBadgeText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  locationContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 35,
    marginHorizontal: 10,
  },
  text: {
    fontSize: 10,
  },
  locationText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 80, // Tránh bị chồng lấp bởi BottomNavigation
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#FFD700",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 3,
  },
  qrButton: {
    padding: 10,
  },
  searchBar: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  heartButton: {
    padding: 10,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  card: {
    width: width * 0.45,
    height: 80,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  cardSubTitle: {
    fontSize: 12,
    color: "#666",
  },
  bookNowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bookNowTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  promotionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    // marginLeft: 10
  },
  promotionsContainerSlider: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    marginLeft: 10
  },
  promotionItem: {
    width: width * 0.45,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
  },
  promotionItemBaner: {
    width: width * 0.95,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
  },
  promotionImage: {
    width: "100%",
    height: 120,
  },
  promotionText: {
    fontSize: 14,
    padding: 10,
  },
  promotionDate: {
    fontSize: 12,
    paddingHorizontal: 10,
    color: "#888",
    marginBottom: 10
  },
  activeRideContainer: {
    position: "absolute",
    bottom: 70,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  activeRideContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeRideImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  activeRideText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  activeRideSubText: {
    fontSize: 12,
    color: "#666",
  },
});

export default Home;
