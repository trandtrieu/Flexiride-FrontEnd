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
          `http://${IP_ADDRESS}:3000/activity-history/${authState.userId}`
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
          status: item.status === "completed" ? "Hoàn thành" : "Đã hủy",
          vehicle: "bike", // Adjust based on API data
        }))
      );
    } catch (error) {
      console.error("Error fetching activities:  ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedTab]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Image
          source={
            item.vehicle === "bike"
              ? require("../assets/bike-icon.png")
              : require("../assets/car-icon.png")
          }
          style={styles.icon}
        />
        <View style={styles.details}>
          <Text
            style={[
              styles.status,
              item.status === "Đã hủy" && styles.statusCanceled,
            ]}
          >
            {item.status}
          </Text>
          <Text style={styles.route}>
            Từ {item.from} đến {item.to}
          </Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {item.price && <Text style={styles.price}>{item.price}</Text>}
        <TouchableOpacity
          style={styles.reorderButton}
          onPress={() => console.log("Reordering:", item)}
        >
          <Text style={styles.reorderText}>Đặt lại</Text>
          <Ionicons name="arrow-forward" size={16} color="#007BFF" />
        </TouchableOpacity>
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
    backgroundColor: "#F9F9F9",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  activeTabButton: {
    backgroundColor: "#007BFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
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
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#28A745",
  },
  statusCanceled: {
    color: "#DC3545",
  },
  route: {
    fontSize: 14,
    color: "#333333",
    marginVertical: 5,
  },
  date: {
    fontSize: 12,
    color: "#666666",
  },
  actions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  reorderText: {
    fontSize: 14,
    color: "#007BFF",
    marginRight: 5,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888888",
    marginTop: 20,
  },
  loader: {
    marginTop: 50,
  },
});

export default ActivityScreen;
