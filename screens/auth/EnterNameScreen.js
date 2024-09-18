import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EnterNameScreen = ({ navigation }) => {
  const [name, setName] = useState("");

  const handleContinue = () => {
    if (name) {
      navigation.navigate("VerifyWithSelfie");
    } else {
      alert("Vui lòng nhập tên của bạn!");
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.header}>BẮT ĐẦU</Text>
      <Text style={styles.label}>Tên</Text>
      <TextInput
        style={styles.input}
        placeholder="Bạn thích mọi người gọi bạn bằng tên..."
        placeholderTextColor="#ccc"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.termsText}>
        Bằng cách tiếp tục, bạn xác nhận rằng bạn đã đọc và đồng ý với{" "}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL("https://www.example.com/terms")}
        >
          Điều Khoản Dịch Vụ
        </Text>{" "}
        và{" "}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL("https://www.example.com/privacy")}
        >
          Thông Báo Bảo Mật
        </Text>{" "}
        của chúng tôi.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    marginTop: 40,
    marginBottom: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderBottomWidth: 1,
    marginBottom: 20,
    fontSize: 16,
    paddingLeft: 10,
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginVertical: 20,
  },
  link: {
    color: "#4a90e2",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#8e44ad", // Purple button background
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EnterNameScreen;
