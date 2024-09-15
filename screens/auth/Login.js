import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

export default function Login({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true); // Bắt đầu loading
      const response = await axios.post("http://localhost:3000/auth/login", {
        phone: phoneNumber,
        password: password,
      });

      const { token, user } = response.data;

      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem("token", token);

      Alert.alert("Success", "Login successful!");

      // Sau khi login thành công, điều hướng đến trang Home
      navigation.navigate("Home", { user });
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Authenticate")}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.headerText}>Welcome! Login with your account</Text>
      <Text style={styles.subText}>
        With a valid number, you can access rides, deliveries, and our other
        services.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        placeholderTextColor="#ccc"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#ccc"
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? "#999" : "#000" }]} // Đổi màu khi loading
        onPress={handleLogin}
        disabled={loading} // Vô hiệu hóa khi đang loading
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
  },
  subText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    textAlign: "left",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
