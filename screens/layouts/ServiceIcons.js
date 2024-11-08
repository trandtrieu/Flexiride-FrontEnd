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
        <Text style={styles.serviceText}>Xe máy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.serviceItem}>
        <Image
          source={require("../../assets/car-icon.png")}
          style={styles.serviceIcon}
        />
        <Text style={styles.serviceText}>Ô tô</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.serviceItem}
        onPress={() => navigation.navigate("HireDriver")}
      >
        <Image
          source={require("../../assets/hire-driver-icon.png")}
          style={styles.serviceIcon}
        />
        <Text style={styles.serviceText}>Thuê tài xế</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.serviceItem}
        onPress={() => navigation.navigate("ServiceSelection")}>
        <Image
          source={require("../../assets/car-pool-icon.png")}
          style={styles.serviceIcon}
        />
        <Text style={styles.serviceText}>Xe ghép</Text>
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
