import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../../assets/Logo.png")} style={styles.logo} />
        <Text style={styles.subtitle}>
          Chuyến đi của bạn, sự lựa chọn của bạn
        </Text>
      </View>

      <Image
        source={require("../../assets/illustration.png")}
        style={styles.illustration}
      />

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("LoginOptions")}
      >
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("ServiceSelection")}
      >
        <Text style={styles.loginButtonText}>Zô</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.registerButtonText}>
          Bạn mới biết đến FRide? Hãy đăng ký!
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC323",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7A2113",
    textAlign: "center",
    marginBottom: 20,
  },
  illustration: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: "#270C6D",
    paddingVertical: 15,
    paddingHorizontal: 130,
    borderRadius: 30,
    marginBottom: 20,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
  },
  registerButton: {
    borderColor: "#270C6D",
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
  },
  registerButtonText: {
    color: "#270C6D",
    fontSize: 16,
  },
  leftImage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  rightImage: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
});
