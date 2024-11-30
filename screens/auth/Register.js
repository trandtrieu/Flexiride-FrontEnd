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
import axios from "axios";

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

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải đúng 10 chữ số.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Vui lòng nhập email hợp lệ.";
    }

    if (!password) {
      newErrors.password = "Mật khẩu không được để trống.";
    }

    if (!rePassword) {
      newErrors.rePassword = "Vui lòng xác nhận mật khẩu.";
    } else if (password.trim() !== rePassword.trim()) {
      newErrors.rePassword = "Mật khẩu không khớp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setHasSubmitted(true);

    if (validateForm()) {
      setIsLoading(true);

      const account = {
        phone: phoneNumber,
        email: email,
        password: password,
        code: generateVerificationCode(),
      };

      try {
        setIsLoading(false);
        navigation.navigate("VerificationScreen", { account });
      } catch (error) {
        console.error("Lỗi trong quá trình gọi API:", error);
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
        <Text style={styles.headerText}>Đăng ký tài khoản</Text>
        <Text style={styles.subText}>
          Với số điện thoại hợp lệ, bạn có thể sử dụng dịch vụ đặt xe, thuê tài
          xế, xe ghép và các dịch vụ khác của chúng tôi.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
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
            placeholder="Mật khẩu"
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
            placeholder="Xác nhận mật khẩu"
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
            <Text style={styles.buttonText}>Tiếp tục</Text>
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
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
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
