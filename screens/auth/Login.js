import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "../../provider/AuthProvider";
import { IP_ADDRESS, VIETMAP_API_KEY } from "@env";

const Login = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { authenticate } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    // Phone number validation
    if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải bao gồm 10 chữ số.";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setHasSubmitted(true);

    if (validateForm()) {
      setIsLoading(true);
      const loginData = {
        phone: phoneNumber,
        password: password,
        role: "1",
      };
      console.log("🚀 ~ handleSubmit ~ loginData: ", loginData);
      try {
        const response = await axios.post(
          `https://flexiride.onrender.com/auth/login`,
          loginData
        );
        if (response.data.token) {
          await authenticate({
            token: response.data.token,
            user: response.data.user,
          });
          navigation.navigate("Home");
          // navigation.navigate("CustomerProfile");
        }
      } catch (error) {
        // console.error("Error during login:  ", error);
        setErrors({ general: "Số điện thoại hoặc mật khẩu không đúng." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPasswordDriver");
  };

  const handleSignUp = () => {
    navigation.navigate("Register");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Chào mừng bạn trở lại FRide!</Text>
        </View>

        <Image
          style={styles.logo}
          source={require("../../assets/Login_theme1.png")}
        />

        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholderTextColor="#9e9e9e"
        />
        {hasSubmitted && errors.phoneNumber ? (
          <Text style={styles.errorText}>{errors.phoneNumber}</Text>
        ) : null}

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#9e9e9e"
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
        {errors.general && ( // Hiển thị lỗi nếu có
          <Text style={styles.errorText}>{errors.general}</Text>
        )}

        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.signupText}>
            Bạn chưa có tài khoản? Đăng ký ngay
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 60,
    backgroundColor: "#FFC323",
    paddingTop: 120
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#5F3A8E",
  },
  subtitle: {
    fontSize: 16,
    color: "#5F3A8E",
    marginTop: 5,
  },
  // logo: {
  //   alignSelf: "center",
  //   marginBottom: 40,
  //   width: 220,
  //   height: 100,
  //   resizeMode: "contain",
  // },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 1,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#5F3A8E",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#270C6D",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 25,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 15,
  },
  signupText: {
    color: "#5F3A8E",
    textAlign: "center",
    fontSize: 14,
  },
  logo: {
    width: '100%',
    height: undefined,
    aspectRatio: 2,
    resizeMode: 'contain',
    marginBottom: 20,
  },
});

export default Login;
