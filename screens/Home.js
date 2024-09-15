import { View, Text, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Home = () => {
  const [token, setToken] = useState("");

  useEffect(() => {
    // Lấy token từ AsyncStorage khi component được render
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken); // Lưu token vào state
        }
      } catch (error) {
        console.log("Error fetching token:", error);
      }
    };

    fetchToken(); // Gọi hàm lấy token
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Home Screen</Text>
      <Text style={styles.tokenText}>Token: {token}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tokenText: {
    fontSize: 16,
    color: "#333",
  },
});

export default Home;
