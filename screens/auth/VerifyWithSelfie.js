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

export default function VerifyWithSelfie({ navigation }) {
  const handleBack = () => {
    navigation.goBack();
  };
  const handleSubmitLater = () => {
    navigation.navigate("Home");
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.header}>Xác minh bằng ảnh selfie</Text>

      <Text style={styles.instructions}>
        Hãy chụp ảnh selfie nào! Việc xác minh danh tính của người dùng giúp
        nâng cao mức độ an toàn.
      </Text>

      <View style={styles.selfieExamples}>
        <View style={styles.example}>
          <Image
            source={require("../../assets/wrong_selfie.png")}
            style={styles.selfieImage}
          />
        </View>
        <View style={styles.example}>
          <Image
            source={require("../../assets/right_selfie.png")}
            style={styles.selfieImage}
          />
        </View>
      </View>

      <Text style={styles.subInstructions}>
        Hãy chắc rằng ảnh selfie thể hiện rõ và đầy đủ khuôn mặt của bạn.
      </Text>

      <Text style={styles.legalText}>
        Bằng cách nhấp vào "Bắt đầu", tôi đồng ý sử dụng ảnh chân dung từ chụp
        của mình cho các mục đích an toàn, tuân thủ và xác minh.
      </Text>

      <TouchableOpacity style={styles.buttonPrimary}>
        <Text style={styles.buttonText}>Bắt đầu - 1 phút</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={handleSubmitLater}
      >
        <Text style={styles.buttonTextSecondary}>Xác minh sau</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    position: "absolute",
    top: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  instructions: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  selfieExamples: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: width * 0.8,
    marginBottom: 20,
  },
  example: {
    alignItems: "center",
  },
  selfieImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  wrongText: {
    fontSize: 24,
    color: "red",
  },
  rightText: {
    fontSize: 24,
    color: "green",
  },
  subInstructions: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  legalText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonPrimary: {
    backgroundColor: "#5D3FD3",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonSecondary: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 30,
    fontSize: 16,
    width: "100%",
    alignItems: "center",
  },
  buttonTextSecondary: {
    color: "#5D3FD3",
    fontSize: 16,
    fontWeight: "bold",
  },
});
