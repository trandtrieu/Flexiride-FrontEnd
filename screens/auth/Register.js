import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Register({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm tạo mã 6 chữ số ngẫu nhiên
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    if (!rePassword) {
      newErrors.rePassword = "Please confirm your password.";
    } else if (password.trim() !== rePassword.trim()) {
      newErrors.rePassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setHasSubmitted(true);

    if (validateForm()) {
      setIsLoading(true);

      // Tạo đối tượng account với mã xác minh
      const account = {
        phone: phoneNumber,
        email: email,
        password: password,
        code: generateVerificationCode(), // Tạo mã 6 số ngẫu nhiên
      };

      try {
        // const response = await axios.post("http://localhost:3000/service/send-sms", {
        //   body: Check,
        //   phone: phoneNumber,
        // });
        // Điều hướng đến màn hình VerificationScreen và gửi đối tượng account
        setIsLoading(false);
        navigation.navigate("VerificationScreen", { account });
      } catch (error) {
        console.error("Error during API call:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleRePasswordVisibility = () => setShowRePassword(!showRePassword);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Authenticate")}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.headerText}>
          Welcome! Register with your account
        </Text>
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
        {hasSubmitted && errors.phoneNumber ? (
          <Text style={styles.errorText}>{errors.phoneNumber}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#ccc"
        />
        {hasSubmitted && errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#ccc"
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={32}
              color="black"
            />
          </TouchableOpacity>
        </View>
        {hasSubmitted && errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Re-Password"
            value={rePassword}
            onChangeText={setRePassword}
            secureTextEntry={!showRePassword}
            placeholderTextColor="#ccc"
          />
          <TouchableOpacity
            onPress={toggleRePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showRePassword ? "eye-off" : "eye"}
              size={32}
              color="black"
            />
          </TouchableOpacity>
        </View>
        {hasSubmitted && errors.rePassword ? (
          <Text style={styles.errorText}>{errors.rePassword}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Next</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
  },
  subText: {
    fontSize: 18,
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
    fontSize: 19,
    backgroundColor: "#f9f9f9",
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 15,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 1,
  },
  button: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 15,
  },
});
