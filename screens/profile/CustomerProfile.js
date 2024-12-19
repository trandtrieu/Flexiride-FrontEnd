import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
// import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../provider/AuthProvider";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker from expo
import { uploadImageToCloudinary } from "../../utils/CloudinaryConfig";
import {
  updateDriver,
  getDriverById,
  updateCustomer,
} from "../../service/CustomerService";
import { getCustomerById } from "../../service/CustomerService";
import { Ionicons } from "@expo/vector-icons";
const CustomerProfile = ({ route }) => {
  const { authState, logout } = useAuth();
  const [personalInfo, setPersonalInfo] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // Manage modal visibility
  const navigation = useNavigation();

  const refreshData = async () => {
    try {
      // Call getCustomerById API
      const customerData = await getCustomerById(authState.userId);

      // Update state with the customer data
      setPersonalInfo(customerData);
    } catch (error) {
      console.error("Error fetching customer data: ", error);
      // Handle error appropriately (e.g., show an alert or set an error state)
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshData(); // Call the refreshData function when the screen is focused
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const requestCameraPermission = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Quyền truy cập", "Quyền truy cập camera bị từ chối.");
      return;
    }
    takePhoto();
  };

  const requestLibraryPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Quyền truy cập", "Quyền truy cập thư viện ảnh bị từ chối.");
      return;
    }
    pickImage();
  };

  // Function to open image picker
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Quyền truy cập", "Quyền truy cập thư viện ảnh bị từ chối.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setModalVisible(false);
      const uploadedAvatarUrl = await uploadImageToCloudinary(
        result.assets[0].uri
      ); // Using the image from the result
      const updatedInfo = {
        avatar: uploadedAvatarUrl,
      };
      await updateCustomer(authState.userId, updatedInfo, authState.token);
      console.log("url ảnh", uploadedAvatarUrl);
    }
  };

  // Function to open the camera
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Quyền truy cập", "Quyền truy cập camera bị từ chối.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setModalVisible(false);
      const uploadedAvatarUrl = await uploadImageToCloudinary(
        result.assets[0].uri
      ); // Using the image from the result
      const updatedInfo = {
        avatar: uploadedAvatarUrl,
      };
      await updateCustomer(authState.userId, updatedInfo, authState.token);
      console.log("url ảnh", uploadedAvatarUrl);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons
            onPress={() => navigation.navigate("Home")}
            name="arrow-back-outline"
            size={24}
            color="#000"
          />
          <Text style={styles.headerText}>Thông tin cá nhân</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri:
                  selectedImage ||
                  personalInfo.avatar ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.cameraIcon}
              onPress={() => setModalVisible(true)} // Show modal when clicked
            >
              <Ionicons name="camera-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{personalInfo.name}</Text>
        </View>

        <View style={styles.personalInfoSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("UpdateCusInfo", {
                token: authState.token,
                customerId: authState.userId,
                personalInfo,
              })
            }
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Cập nhật</Text>
          </TouchableOpacity>

          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#333" />
            <Text style={styles.infoText}>{personalInfo.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color="#333" />
            <Text style={styles.infoText}>{personalInfo.phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="transgender-outline" size={20} color="#333" />
            <Text style={styles.infoText}>{personalInfo.gender}</Text>
          </View>
        </View>

        <View style={styles.utilitiesSection}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ChangePassword", {
                token: authState.token,
                customerId: authState.userId,
              })
            }
            style={styles.utilityItem}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.utilityItem}>
            <Ionicons name="download-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Downloads</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.utilityItem}>
            <Ionicons name="help-circle-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Trợ giúp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.lastUtilityItem}
          >
            <Ionicons name="log-out-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for image selection */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={30} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn ảnh</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.leftButton]}
                  onPress={requestCameraPermission} // Request camera permission
                >
                  <Text style={styles.buttonText}>Mở Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.rightButton]}
                  onPress={requestLibraryPermission} // Request library permission
                >
                  <Text style={styles.buttonText}>Chọn từ thư viện</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 20,
    color: "#000",
    fontWeight: "bold",
    marginLeft: 8,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  profileImageContainer: {
    position: "relative",
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#FFC323",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFC323",
    borderRadius: 50,
    padding: 6,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 10,
    color: "#333",
  },
  personalInfoSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    position: "absolute",
    right: 16,
    top: 0,
  },
  editButtonText: {
    color: "#007BFF",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
  },
  utilitiesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  utilityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  utilityText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#007BFF",
  },
  lastUtilityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  //modal
  modalContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // Allows absolute positioning for the close icon
    marginTop: 80,
    marginBottom: 80,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  button: {
    backgroundColor: "#FFC323",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 8,
  },

  buttonText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
  },

  leftButton: {
    marginRight: 4, // Space between the buttons
  },

  rightButton: {
    marginLeft: 4, // Space between the buttons
  },
});

export default CustomerProfile;
