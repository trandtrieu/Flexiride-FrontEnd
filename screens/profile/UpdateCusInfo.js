import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
// import Icon from "react-native-vector-icons/FontAwesome";
import {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
} from "../../service/CustomerService";
import { Ionicons } from "@expo/vector-icons";

const UpdateCusInfo = ({ navigation, route }) => {
  const { token, customerId } = route.params;
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [errors, setErrors] = useState({});
  const [genderOptionsVisible, setGenderOptionsVisible] = useState(false);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const customerData = await getCustomerById(customerId);
        setEmail(customerData.email || "");
        setPhone(customerData.phone || "");
        setSelectedGender(customerData.gender || "");
      } catch (error) {
        Alert.alert("Error", "Failed to load customer information.");
        console.error("Error fetching customer details: ", error.message);
      }
    };

    fetchCustomerDetails();
  }, [customerId]);

  const handleUpdate = async () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    try {
      const existingCustomers = await getAllCustomers();
      const currentCustomer = await getCustomerById(customerId);

      // Validate email
      if (!email) {
        newErrors.email = "Email không được để trống.";
      } else if (!emailRegex.test(email)) {
        newErrors.email = "Vui lòng nhập email hợp lệ.";
      } else if (email !== currentCustomer.email) {
        const emailExists = existingCustomers.some(
          (customer) => customer.email === email && customer.id !== customerId
        );
        if (emailExists) {
          newErrors.email = "Email này đã tồn tại.";
        }
      }

      // Validate phone
      if (!phone) {
        newErrors.phone = "Số điện thoại không được để trống.";
      } else if (!phoneRegex.test(phone)) {
        newErrors.phone = "Số điện thoại phải là 10 chữ số.";
      } else if (phone !== currentCustomer.phone) {
        const phoneExists = existingCustomers.some(
          (customer) => customer.phone === phone && customer.id !== customerId
        );
        if (phoneExists) {
          newErrors.phone = "Số điện thoại này đã tồn tại.";
        }
      }

      // Validate gender
      if (!selectedGender) {
        newErrors.gender = "Vui lòng chọn giới tính.";
      }

      setErrors(newErrors);

      // Proceed to update if no errors
      if (Object.keys(newErrors).length === 0) {
        const updatedInfo = { email, phone, gender: selectedGender };
        await updateCustomer(customerId, updatedInfo, token);

        Alert.alert("Thành công", "Cập nhật thông tin cá nhân thành công!");
        navigation.replace("CustomerProfile");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại sau.");
      console.error("Error updating customer info:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("CustomerProfile")}
      >
        <Ionicons name="arrow-back-outline" size={20} color="black" />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.headerText}>Cập nhật thông tin cá nhân</Text>
          <Text style={styles.subHeaderText}>
            Cung cấp thông tin cần cập nhật
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email *"
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              placeholderTextColor="#6D6A6A"
            />
            {errors.email && (
              <Text style={styles.errorMessage}>{errors.email}</Text>
            )}

            <TextInput
              placeholder="Phone *"
              style={styles.input}
              onChangeText={setPhone}
              value={phone}
              keyboardType="phone-pad"
              placeholderTextColor="#6D6A6A"
            />
            {errors.phone && (
              <Text style={styles.errorMessage}>{errors.phone}</Text>
            )}

            <Text style={styles.label}>Giới tính *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setGenderOptionsVisible(!genderOptionsVisible)}
            >
              <Text>{selectedGender || "Chọn giới tính"}</Text>
              <Ionicons
                name={genderOptionsVisible ? "caret-up" : "caret-down"}
                size={20}
                color="#6D6A6A"
                style={styles.dropdownIcon}
              />
            </TouchableOpacity>

            {genderOptionsVisible && (
              <View style={styles.optionsContainer}>
                {["Nam", "Nữ", "Khác"].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={styles.optionItem}
                    onPress={() => {
                      setSelectedGender(gender);
                      setGenderOptionsVisible(false);
                    }}
                  >
                    <Text>{gender}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.gender && (
              <Text style={styles.errorMessage}>{errors.gender}</Text>
            )}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Cập nhật</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "flex-start",
    paddingTop: 30,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  inputContainer: {
    width: "100%",
  },
  content: {
    width: "100%",
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 300,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
    textAlign: "left",
  },
  subHeaderText: {
    fontSize: 16,
    textAlign: "left",
    paddingHorizontal: 0,
    fontWeight: "300",
    marginBottom: 10,
  },
  label: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    height: 50,
    marginHorizontal: 0,
    borderWidth: 1,
    padding: 10,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#6C6A6A",
    margin: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 8,
  },
  optionsContainer: {
    maxHeight: 150,
    overflow: "scroll",
    borderWidth: 1,
    borderColor: "#6C6A6A",
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  optionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#6C6A6A",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    width: "100%",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#6C6A6A",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#000",
    flexShrink: 1,
    maxWidth: "85%",
  },
  button: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-end",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  errorMessage: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    padding: 10,
    marginTop: -20,
    width: 50,
  },
  dropdownIcon: {
    marginLeft: 10,
  },
});

export default UpdateCusInfo;
