import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../provider/AuthProvider";

const ActivityScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("Đặt xe");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { authState } = useAuth();

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let history = [];
      if (selectedTab === "Đặt xe") {
        // Fetch completed and canceled bookings
        const response = await axios.get(
          `https://flexiride.onrender.com/activity-history/${authState.userId}`
        );
        history = response.data.history || [];
      } else {
        history = []; // Placeholder for other tabs
      }

      // Map data into display format
      setActivities(
        history.map((item, index) => ({
          id: `${index}`,
          from: item.pickup,
          to: item.destination,
          date: item.time,
          price: item.price ? `${item.price.toLocaleString("vi-VN")}₫` : null,
          status: item.status === "Hoàn thành" ? "Hoàn thành" : "Đã hủy",
          vehicle: "bike", // Adjust based on API data
          pickupCoordinates: item.pickupCoordinates, // Thêm tọa độ điểm đón
          destinationCoordinates: item.destinationCoordinates, // Thêm tọa độ điểm đến
        }))
      );
    } catch (error) {
      console.error("Error fetching activities: ssss ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedTab]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <Image
          source={
            item.vehicle === "bike"
              ? require("../assets/bike-icon.png")
              : require("../assets/car-icon.png")
          }
          style={styles.icon}
        />
      </View>
      <View style={styles.rightSection}>
        <Text
          style={[
            styles.status,
            item.status === "Đã hủy" && styles.statusCanceled,
          ]}
        >
          {item.status}
        </Text>
        <Text style={styles.route}>Từ: {item.from}</Text>
        <Text style={styles.route}>Đến: {item.to}</Text>
        <Text style={styles.date}>{item.date}</Text>
        <View style={styles.actions}>
          {item.price && <Text style={styles.price}>{item.price}</Text>}
          <TouchableOpacity
            style={styles.reorderButton}
            onPress={() =>
              navigation.navigate("RouteScreen", {
                pickupLocation: {
                  latitude: item.pickupCoordinates.latitude,
                  longitude: item.pickupCoordinates.longitude,
                  name: item.from,
                },
                destinationLocation: {
                  latitude: item.destinationCoordinates.latitude,
                  longitude: item.destinationCoordinates.longitude,
                  name: item.to,
                },
              })
            }
          >
            <Text style={styles.reorderText}>Đặt lại</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderContent = () => (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={() => (
        <Text style={styles.emptyText}>Không có hoạt động nào</Text>
      )}
      contentContainerStyle={styles.list}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {["Đặt xe", "Thuê tài xế", "Xe ghép"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : (
        renderContent()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: "#4A90E2",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#EDEDED",
    flexDirection: "row",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  leftSection: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E6F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  icon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  rightSection: {
    flex: 1,
  },
  status: {
    fontSize: 16,
    fontWeight: "700",
    color: "#28A745",
  },
  statusCanceled: {
    color: "#FF6B6B",
  },
  route: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginVertical: 4,
  },
  date: {
    fontSize: 13,
    color: "#888888",
  },
  actions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  reorderText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginRight: 5,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888888",
    marginTop: 50,
  },
  loader: {
    marginTop: 50,
  },
});

export default ActivityScreen;
