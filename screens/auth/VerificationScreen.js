import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const VerificationScreen = ({ navigation }) => {
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleResendCode = () => {
    setTimer(30);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Enter the 6-digit code sent to your email: trandtrieu@gmail.com
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          keyboardType="number"
          maxLength={6}
          placeholder="123456"
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
        style={styles.button}
        // onPress={() => navigation.navigate("VerificationScreen")}
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
