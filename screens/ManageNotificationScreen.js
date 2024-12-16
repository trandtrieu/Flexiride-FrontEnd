import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Sử dụng icon
import { getPersonalNotification } from "../service/CommonServiceApi";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { useAuth } from "../provider/AuthProvider";

const ManageNotifications = ({ route, navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { authState } = useAuth();

  // Hàm điều hướng đến màn hình chi tiết thông báo
  const navigateToNotificationDetail = (notification) => {
    navigation.navigate("NotificationDetail", { notification });
  };

  // Hàm lấy dữ liệu thông báo
  const fetchNotifications = async () => {
    try {
      const response = await getPersonalNotification(authState.token);
      console.log("Fetching notifications: ", response.data);

      // Kiểm tra xem response.data.notifications có tồn tại không
      if (response.data && Array.isArray(response.data.notifications)) {
        // Sắp xếp theo ngày (ngày gần nhất đến xa nhất)
        const sortedNotifications = response.data.notifications.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        // Kiểm tra thông báo chưa đọc
        const unreadNotifications = sortedNotifications.filter(
          (notification) => !notification.readBy.includes(response.data.userId)
        );

        // Cập nhật state
        setNotifications(sortedNotifications);
        setUnreadCount(unreadNotifications.length);
        console.log("================ManageNotifications===================");
        console.log("Notifications:", sortedNotifications);
      } else {
        console.error("Không có thông báo hoặc dữ liệu không hợp lệ.");
      }
    } catch (error) {
      // console.error("Error fetching notifications:", error);
    }
  };

  // Sử dụng useFocusEffect để gọi lại fetchNotifications khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications(); // Gọi lại hàm lấy thông báo mỗi khi màn hình có focus
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Thông báo</Text>
      </View>

      {/* Danh sách thông báo */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notificationCard,
              !item.readBy.length && styles.unreadNotification,
            ]} // Thêm class cho thông báo chưa đọc
            onPress={() => navigateToNotificationDetail(item)}
          >
            <View style={styles.cardContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationDescription}>
                {item.description}
              </Text>
            </View>
            {/* Biểu tượng cho thông báo đã đọc/chưa đọc */}
            {!item.readBy.length && (
              <Ionicons name="ios-circle-outline" size={24} color="red" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    backgroundColor: "#FFD700", // Màu vàng nhẹ
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  notificationCard: {
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, // Shadow cho Android
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unreadNotification: {
    borderLeftWidth: 5,
    borderLeftColor: "red", // Đánh dấu thông báo chưa đọc
  },
  cardContent: {
    flex: 1,
    paddingRight: 10, // Để tránh text bị đè lên icon
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  notificationDescription: {
    fontSize: 14,
    color: "#666",
  },
});

export default ManageNotifications;
