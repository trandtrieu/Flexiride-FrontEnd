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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import sendEmail from "../../utils/SentEmail";
import { generateOtpCode } from "../../utils/genCode";
import { getAllCustomers } from "../../service/CustomerService";

export default function Register({ navigation }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const validateForm = async () => {
    const newErrors = {};
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;
    if (!name.trim()) {
      newErrors.name = "Tên không được để trống.";
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải đúng 10 chữ số.";
    } else {
      try {
        const existingCustomers = await getAllCustomers();
        const phoneExists = existingCustomers.some(
          (customer) => customer.phone === phoneNumber
        );

        if (phoneExists) {
          newErrors.phoneNumber = "Số điện thoại này đã tồn tại.";
        }
      } catch (e) {
        console.error("Failed to check existing phone number:", e);
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Vui lòng nhập địa chỉ email hợp lệ.";
    } else {
      try {
        const existingCustomers = await getAllCustomers();
        const emailExists = existingCustomers.some(
          (customer) => customer.email === email
        );

        if (emailExists) {
          newErrors.email = "Email này đã tồn tại.";
        }
      } catch (e) {
        console.error("Failed to check existing email:", e);
      }
    }

    if (!password) {
      newErrors.password = "Mật khẩu không được để trống.";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Mật khẩu phải từ 8-12 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt.";
    }

    if (!rePassword) {
      newErrors.rePassword = "Vui lòng xác nhận mật khẩu.";
    } else if (password.trim() !== rePassword.trim()) {
      newErrors.rePassword = "Mật khẩu không khớp.";
    }

    if (!gender) {
      newErrors.gender = "Vui lòng chọn giới tính.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setHasSubmitted(true);

    const isValid = await validateForm();

    if (!isValid) {
      return;
    }

    const account = {
      name,
      phone: phoneNumber,
      email,
      password,
      gender,
    };

    try {
      const otpCode = generateOtpCode();
      await sendEmail("", email, otpCode);
      navigation.navigate("InsertCode", { otpCode, account });
    } catch (error) {
      console.error("Lỗi trong quá trình gọi API:", error);
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
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity> */}

        <Text style={styles.headerText}>BẮT ĐẦU</Text>

        {/* Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Tên"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#aaa"
        />
        {hasSubmitted && errors.name && (
          <Text style={styles.errorText}>{errors.name}</Text>
        )}

        {/* Gender Selection */}
        <View style={styles.genderContainer}>
          <Text style={styles.genderLabel}>Giới tính</Text>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === "Nam" && styles.selectedOption,
            ]}
            onPress={() => setGender("Nam")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "Nam" && styles.selectedText,
              ]}
            >
              Nam
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === "Nữ" && styles.selectedOption,
            ]}
            onPress={() => setGender("Nữ")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "Nữ" && styles.selectedText,
              ]}
            >
              Nữ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === "Khác" && styles.selectedOption,
            ]}
            onPress={() => setGender("Khác")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "Khác" && styles.selectedText,
              ]}
            >
              Khác
            </Text>
          </TouchableOpacity>
        </View>
        {hasSubmitted && errors.gender && (
          <Text style={styles.errorText}>{errors.gender}</Text>
        )}

        {/* Phone Number */}
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholderTextColor="#aaa"
        />
        {hasSubmitted && errors.phoneNumber && (
          <Text style={styles.errorText}>{errors.phoneNumber}</Text>
        )}

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#aaa"
        />
        {hasSubmitted && errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}

        {/* Password */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        {hasSubmitted && errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        {/* Confirm Password */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            value={rePassword}
            onChangeText={setRePassword}
            secureTextEntry={!showRePassword}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity
            onPress={toggleRePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showRePassword ? "eye-off" : "eye"}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        {hasSubmitted && errors.rePassword && (
          <Text style={styles.errorText}>{errors.rePassword}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Tiếp tục</Text>
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
    justifyContent: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#000",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },
  genderContainer: {
    marginBottom: 15,
    flexDirection: 'row',  // Arrange gender options horizontally
    flexWrap: 'wrap',  // Allow wrapping to the next line if necessary
    justifyContent: 'space-between',  // Distribute space evenly
  },
  genderLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  genderOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {
    backgroundColor: "#270C6D",
  },
  genderText: {
    textAlign: "center",
    color: "#000",
  },
  selectedText: {
    color: "#fff",
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 15,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  button: {
    backgroundColor: "#270C6D",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
  },
});
