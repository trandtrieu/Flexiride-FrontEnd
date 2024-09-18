import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LoginOptions({ navigation }) {
  const handleBack = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.header}>
        <Image source={require("../../assets/Logo.png")} style={styles.logo} />

        <Text style={styles.subtitle}>Siêu ứng dụng đáp ứng mọi chuyến đi</Text>
      </View>
      <View style={styles.auth_theme}>
        <Image
          source={require("../../assets/Login_theme1.png")}
          style={styles.auth_theme1}
        />
      </View>
      <TouchableOpacity style={styles.buttonFacebook}>
        <Image
          source={require("../../assets/facebook.png")}
          style={styles.social_icon}
        />

        <Text style={styles.buttonText}>Tiếp tục với Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonGoogle}>
        <Image
          source={require("../../assets/google.png")}
          style={styles.social_icon}
        />

        <Text style={styles.buttonText}>Tiếp tục với Google</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Hoặc</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Phone Number Button */}
      <TouchableOpacity
        style={styles.buttonPhone}
        onPress={() => navigation.navigate("Login")}
      >
        <Image
          source={require("../../assets/phone.png")}
          style={styles.social_icon}
        />

        <Text style={styles.buttonText}>Tiếp tục với số điện thoại</Text>
      </TouchableOpacity>
    </View>
  );
}
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC323",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    position: "absolute",
    top: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  auth_theme: { padding: 0, paddingHorizontal: 0 },
  auth_theme1: {
    resizeMode: "cover",
    width: width,
    height: 250,
  },
  logo: {
    width: 200,
    height: 85,
  },
  social_icon: {
    width: 18,
    height: 18,
  },
  subtitle: {
    fontSize: 18,
    color: "#7A2113",
    textAlign: "center",
  },
  buttonFacebook: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#270C6D",
    padding: 5,
    borderRadius: 30,
    width: "80%",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 60,
  },
  buttonGoogle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#270C6D",
    padding: 5,
    borderRadius: 30,
    width: "80%",
    justifyContent: "center",
  },
  buttonPhone: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#270C6D",
    padding: 5,
    borderRadius: 30,
    width: "80%",
    justifyContent: "center",
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "white",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "black",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "black",
  },
});
