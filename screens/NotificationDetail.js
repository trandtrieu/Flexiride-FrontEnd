import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Sử dụng icon
import { markAsRead } from "../service/CommonServiceApi";
import { useAuth } from "../provider/AuthProvider";

const NotificationDetail = ({ route, navigation }) => {
  const { notification } = route.params;
  const { authState } = useAuth();

  // Hàm đánh dấu thông báo đã đọc
  useEffect(() => {
    const markAsReadNotification = async () => {
      try {
        await markAsRead(notification._id, authState.token); 
      } catch (error) {
        // console.error("Error marking notification as read", error);
      }
    };

    markAsReadNotification();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="ios-arrow-back"
          size={24}
          color="white"
          onPress={() => navigation.goBack()}
          style={styles.backIcon}
        />
        <Text style={styles.title}>Chi tiết thông báo</Text>
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationDate}>
          {new Date(notification.date).toLocaleString()}
        </Text>
        <Text style={styles.notificationDescription}>{notification.description}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Thông báo đã được đọc</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f8",
  },
  header: {
    backgroundColor: "#FF9800", // Màu cam nổi bật
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backIcon: {
    marginRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  notificationContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  notificationTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  notificationDate: {
    fontSize: 14,
    color: "#999",
    marginBottom: 15,
  },
  notificationDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  footer: {
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  footerText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
});

export default NotificationDetail;
