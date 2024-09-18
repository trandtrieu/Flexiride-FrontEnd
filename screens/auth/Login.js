import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { ScrollView } from "react-native";

export default function Login({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsFormValid(phoneNumber.length === 10 && password.length > 0);
  }, [phoneNumber, password]);

  const handleLogin = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const response = await axios.post("http://your-api-url.com/auth/login", {
        phone: phoneNumber,
        password: password,
      });

      const { token, user } = response.data;
      await AsyncStorage.setItem("token", token);
      Alert.alert("Thành công", "Đăng nhập thành công!");
      navigation.navigate("Home", { user });
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  //test luong hoat dong
  const handleLogin2 = async () => {
    navigation.navigate("Home");
  };

  const handleForgotPassword = () => {
    Alert.alert("Thông báo", "Chức năng quên mật khẩu sẽ được triển khai sau.");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView>
        <ImageBackground
          source={require("../../assets/LoginPhoneTheme.png")}
          style={styles.backgroundImage}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Đăng nhập</Text>
            <Feather name="user" size={24} color="black" style={styles.user} />
          </View>
          <Text style={styles.subText}>Chào mừng bạn trở lại FRiDE!</Text>
          <View style={styles.overlay}>
            <Image
              source={require("../../assets/Logo-2.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                !isFormValid && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin2}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.orText}>Hoặc đăng nhập với</Text>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require("../../assets/google.png")}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require("../../assets/facebook.png")}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerText}>
                Bạn chưa có tài khoản? Đăng ký ngay
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "110%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 23,
    top: 56,
  },
  overlay: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 70,
    marginBottom: 30,
    marginTop: 180,
  },
  headerText: {
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: 24,
    lineHeight: 29,
    color: "#000000",
  },
  user: {
    marginLeft: 10,
  },
  subText: {
    position: "absolute",
    width: 178,
    height: 16,
    left: 23,
    top: 91,
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 16,
    color: "#000000",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#6C6A6A",
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#6C6A6A",
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: "#000",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#FFC323",
    paddingVertical: 12,
    paddingHorizontal: 140,
    borderRadius: 15,
    marginBottom: 10,
  },
  loginButtonText: {
    color: "#000000",
    fontSize: 18,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },

  orText: {
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  socialButton: {
    marginHorizontal: 10,
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
  registerText: {
    marginTop: 20,
    color: "#000",
    textDecorationLine: "underline",
  },
});
