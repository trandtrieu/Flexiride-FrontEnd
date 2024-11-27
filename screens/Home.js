import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "./layouts/BottomNavigation";
import ServiceIcons from "./layouts/ServiceIcons";
import { useAuth } from "../provider/AuthProvider";
import { IP_ADDRESS } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Home = ({ navigation }) => {
  const { authState } = useAuth();
  const [activeRide, setActiveRide] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);

  // Load thông tin chuyến đi từ AsyncStorage
  useEffect(() => {
    console.log("🚀 ~ IP_ADDRESS:", IP_ADDRESS);

    const loadActiveRide = async () => {
      try {
        const ride = await AsyncStorage.getItem("activeRide");
        if (ride) {
          const parsedRide = JSON.parse(ride);
          setActiveRide(parsedRide);
          console.log("Active Ride:", parsedRide);
        }
      } catch (error) {
        console.error("Error loading active ride:", error);
      }
    };

    loadActiveRide();
  }, []);
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

  // Fetch thông tin vị trí tài xế
  useEffect(() => {
    const fetchDriverLocation = async () => {
      if (activeRide?.driverId) {
        try {
          const response = await axios.get(
            `http://${IP_ADDRESS}:3000/booking-traditional/location/driver/${activeRide.driverId}`
          );
          if (response.data && response.data.location) {
            console.log("Driver Location Data:", response.data);
            setDriverDetails(response.data.driverDetails);
          }
        } catch (error) {
          console.error("Error fetching driver location:", error);
        }
      }
    };

    fetchDriverLocation();
  }, [activeRide]);

  const navigateToRide = () => {
    if (activeRide) {
      navigation.navigate("RideTrackingScreen", {
        requestId: activeRide.requestId,
        driverId: activeRide.driverId,
      });
    }
  };

  const testTermsScreen = () => {
    navigation.navigate("TermsScreen")
  }
  return (
    <View style={styles.container}>
      {/* Nội dung chính */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.qrButton}
            onPress={testTermsScreen}
          >
            <Ionicons name="qr-code-outline" size={24} color="black" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchBar}
            placeholder="Tìm kiếm"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <ServiceIcons />

        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Activate</Text>
            <Text style={styles.cardSubTitle}>FRidePay</Text>
            <Ionicons name="wallet-outline" size={24} color="green" />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Use Points</Text>
            <Text style={styles.cardSubTitle}>758</Text>
            <Ionicons name="wallet-outline" size={24} color="blue" />
          </View>
        </View>

        <View style={styles.bookNowContainer}>
          <Text style={styles.bookNowTitle}>ĐẶT XE NGAY</Text>
          <Ionicons name="arrow-forward-outline" size={24} color="black" />
        </View>
        <View style={styles.promotionsContainer}>
          <TouchableOpacity style={styles.promotionItem}>
            <Image
              source={require("../assets/ad-01.png")}
              style={styles.promotionImage}
            />
            <Text style={styles.promotionText}>
              Order mooncakes to gift & to enjoy
            </Text>
            <Text style={styles.promotionDate}>Until 21 Sep</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.promotionItem}>
            <Image
              source={require("../assets/ad-02.png")}
              style={styles.promotionImage}
            />
            <Text style={styles.promotionText}>
              Plus an EXTRA $20 OFF on groceries
            </Text>
            <Text style={styles.promotionDate}>Until 31 Aug</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Thông tin chuyến đi */}
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

      {/* Thanh điều hướng dưới cùng */}
      <BottomNavigation navigation={navigation} />
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 80, // Tránh bị chồng lấp bởi BottomNavigation
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFD700",
  },
  qrButton: {
    padding: 10,
  },
  searchBar: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
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
  },
  promotionItem: {
    width: width * 0.45,
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
