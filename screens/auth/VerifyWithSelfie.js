import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator"; // Import thư viện cắt ảnh
import { registerCustomer } from "../../service/AuthCustomerService"; // Đảm bảo rằng đường dẫn đúng
import { uploadImageToCloudinary } from "../../utils/CloudinaryConfig";
import { getAllCustomers } from "../../service/CustomerService";

export default function VerifyWithSelfie({ navigation, route }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state to track the process
  const account = route.params.account;

  const handleBack = () => {
    navigation.navigate("Register");
  };

  const handleSubmitLater = async () => {
    const customerData = {
      name: account.name,
      phone: account.phone,
      email: account.email,
      password: account.password,
      gender: account.gender,
      avatar: "",
      role: 1,
    };

    try {
      const response = await registerCustomer(customerData);
      console.log("Customer registered successfully:", response);

      // Show alert for successful registration
      Alert.alert(
        "Đăng ký thành công",
        "Tài khoản của bạn đã được đăng ký thành công. Bạn có thể đăng nhập ngay bây giờ.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      navigation.navigate("Login");
    }
  };

  // Function to request permission to access the camera
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === "granted") {
      takePhoto();
    } else {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to take a selfie."
      );
    }
  };

  // Function to take a photo
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);

      // Show loading spinner while processing the image
      setLoading(true);

      try {
        // Resize and compress the image if needed
        const croppedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 500 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Upload the image to Cloudinary
        const uploadedAvatarUrl = await uploadImageToCloudinary(
          croppedImage.uri
        );

        // Prepare customer data
        const customerData = {
          name: account.name,
          phone: account.phone,
          email: account.email,
          password: account.password,
          gender: account.gender,
          avatar: uploadedAvatarUrl,
          role: 1,
        };

        // Register the customer
        const response = await registerCustomer(customerData);
        console.log("Customer registered successfully:", response);

        // Show alert for successful registration
        Alert.alert(
          "Đăng ký thành công",
          "Tài khoản của bạn đã được đăng ký thành công. Bạn có thể đăng nhập ngay bây giờ.",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      } catch (error) {
        console.error("Registration failed:", error);
      } finally {
        // navigation.navigate("Login");
        // Hide loading spinner once the process is complete
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.header}>Xác minh bằng ảnh selfie</Text>
      <Text style={styles.instructions}>
        Hãy chụp ảnh selfie nào! Việc xác minh danh tính của người dùng giúp
        nâng cao mức độ an toàn.
      </Text>

      <View style={styles.selfieExamples}>
        <View style={styles.example}>
          <Image
            source={require("../../assets/wrong_selfie.png")}
            style={styles.selfieImage}
          />
        </View>
        <View style={styles.example}>
          <Image
            source={require("../../assets/right_selfie.png")}
            style={styles.selfieImage}
          />
        </View>
      </View>

      <Text style={styles.subInstructions}>
        Hãy chắc rằng ảnh selfie thể hiện rõ và đầy đủ khuôn mặt của bạn.
      </Text>

      <Text style={styles.legalText}>
        Bằng cách nhấp vào "Bắt đầu", tôi đồng ý sử dụng ảnh chân dung từ chụp
        của mình cho các mục đích an toàn, tuân thủ và xác minh.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#5D3FD3" style={styles.loader} />
      ) : (
        <>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={requestCameraPermission}
          >
            <Text style={styles.buttonText}>Bắt đầu - 1 phút</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={handleSubmitLater}
          >
            <Text style={styles.buttonTextSecondary}>Xác minh sau</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    position: "absolute",
    top: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  instructions: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  selfieExamples: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: width * 0.8,
    marginBottom: 20,
  },
  example: {
    alignItems: "center",
  },
  selfieImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  wrongText: {
    fontSize: 24,
    color: "red",
  },
  rightText: {
    fontSize: 24,
    color: "green",
  },
  subInstructions: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  legalText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonPrimary: {
    backgroundColor: "#5D3FD3",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonSecondary: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 30,
    fontSize: 16,
    width: "100%",
    alignItems: "center",
  },
  buttonTextSecondary: {
    color: "#5D3FD3",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginBottom: 20,
  },
});
