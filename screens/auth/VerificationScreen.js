import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const VerificationScreen = ({ navigation, route }) => {
  const [code, setCode] = useState("");
  const [check, setCheck] = useState("");
  const [timer, setTimer] = useState(30);
  const { account } = route.params;

  // Chuyển đổi số điện thoại từ định dạng địa phương sang định dạng quốc tế
  const toPhone = account.phone.startsWith("0")
    ? `+84${account.phone.substring(1)}`
    : account.phone;

  useEffect(() => {
    const generateAndSendCode = async () => {
      const newCode = generateVerificationCode();
      setCheck(newCode);

      try {
        await axios.post("http://localhost:3000/service/send-sms", {
          body: newCode,
          phone: toPhone,
        });
        console.log("Verification code sent.");
      } catch (error) {
        console.error("Failed to send verification code:", error);
        Alert.alert(
          "Error",
          "Failed to send verification code. Please try again."
        );
      }
    };

    generateAndSendCode();

    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer((prevTimer) => prevTimer - 1);
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleResendCode = async () => {
    const newCode = generateVerificationCode();
    setCheck(newCode);
    setTimer(30);

    try {
      await axios.post("http://localhost:3000/service/send-sms", {
        body: newCode,
        phone: toPhone,
      });
      console.log("Verification code resent.");
    } catch (error) {
      console.error("Failed to resend verification code:", error);
      Alert.alert(
        "Error",
        "Failed to resend verification code. Please try again."
      );
    }
  };

  const isCodeValid = code.length === 6 && !isNaN(code);

  const handleSubmit = async () => {
    if (code === check) {
      try {
        const response = await axios.post(
          "http://localhost:3000/auth/register-customer",
          {
            phone: toPhone,
            email: account.email,
            password: account.password,
            role: 1
          }
        );

        const { token } = response.data;

        await AsyncStorage.setItem("token", token);

        Alert.alert("Success", "Registration successful!");
        navigation.navigate("EnterNameScreen");
      } catch (error) {
        console.error("Failed to complete registration:", error);
        Alert.alert(
          "Error",
          "Failed to complete registration. Please try again."
        );
      }
    } else {
      Alert.alert("Error", "Invalid verification code.");
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
      <Text style={styles.label}>
        Enter the 6-digit code sent to your phone: {toPhone}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder=""
        />
        {code.length > 0 && (
          <TouchableOpacity onPress={() => setCode("")}>
            <Text style={styles.clear}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.resendContainer}
        onPress={handleResendCode}
        disabled={timer > 0}
      >
        <Text style={styles.resendText}>
          {timer > 0
            ? `Request new code in 00:${timer < 10 ? `0${timer}` : timer}`
            : "Request new code"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isCodeValid ? "#007BFF" : "#ccc" },
        ]}
        onPress={handleSubmit}
        disabled={!isCodeValid}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  label: {
    fontSize: 19,
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  input: {
    fontSize: 25,
    textAlign: "center",
    flex: 1,
    letterSpacing: 10,
  },
  clear: {
    fontSize: 28,
    color: "#999",
    padding: 10,
  },
  resendContainer: {
    alignItems: "center",
  },
  resendText: {
    fontSize: 16,
    color: "#007BFF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#ccc",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
});

export default VerificationScreen;
