import React, { useEffect } from "react";
import { View, Image, StyleSheet, StatusBar, Dimensions } from "react-native";
import { useAuth } from "../provider/AuthProvider";

const Splash = ({ navigation }) => {
  const { authState } = useAuth(); // Destructure to get the auth state directly

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authState.isAuthenticated && authState.token) {
        navigation.replace("Home");
      } else {
        navigation.replace("Login");
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [navigation, authState.isAuthenticated, authState.token]);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.background}>
        <Image source={require("../assets/Logo.png")} style={styles.logo} />
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../assets/splash.png")}
            style={styles.illustration}
          />
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fbc02d",
    padding: 0,
    margin: 0,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fbc02d",
  },
  logo: {
    width: 150,
    height: 80,
    marginBottom: 300,
  },
  illustrationContainer: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  illustration: {
    width: width,
    height: 310,
    resizeMode: "cover",
  },
});

export default Splash;
