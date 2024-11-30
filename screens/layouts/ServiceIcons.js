import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const ServiceIcons = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.servicesContainer}>
      <TouchableOpacity
        style={styles.serviceItem}
        onPress={() => navigation.navigate("BikeBook")}
      >
        <Image
          source={require("../../assets/bike-icon.png")}
          style={styles.serviceIcon}
        />
        <Text style={styles.serviceText}>Đặt Xe</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.serviceItem}
        onPress={() => navigation.navigate("HireDriverScreen")}
      >
        <Image
          source={require("../../assets/hire-driver-icon.png")}
          style={styles.serviceIcon}
        />
        <Text style={styles.serviceText}>Thuê Tài Xế</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.serviceItem}
        onPress={() => navigation.navigate("ServiceSelection")}
      >
        <Image
          source={require("../../assets/car-pool-icon.png")}
          style={styles.serviceIcon}
        />
        <Text style={styles.serviceText}>Xe Ghép</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  servicesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  serviceItem: {
    alignItems: "center",
  },
  serviceIcon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  serviceText: {
    fontSize: 12,
  },
});

export default ServiceIcons;
