import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BottomNavigation = ({ navigation }) => {
  return (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Home")}
      >
        <Ionicons name="home-outline" size={24} color="#FFD700" />
        <Text style={styles.navText}>Trang chủ</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("ActivityScreen")}
      >
        <Ionicons name="document-text-outline" size={24} color="black" />
        <Text style={styles.navText}>Hoạt động</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Payment")}
      >
        <Ionicons name="card-outline" size={24} color="black" />
        <Text style={styles.navText}>Thanh toán</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Messages")}
      >
        <Ionicons name="notifications-outline" size={24} color="black" />
        <Text style={styles.navText}>Tin nhắn</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("CustomerProfile")}
      >
        <Ionicons name="person-outline" size={24} color="black" />
        <Text style={styles.navText}>Tài khoản</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopColor: "#DDD",
    borderTopWidth: 1,
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 60,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: "#333",
  },
});

export default BottomNavigation;
