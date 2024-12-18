import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Keyboard,
  Modal,
  FlatList,
} from "react-native";

import { createCarpoolRequest } from "../../service/BookingCarpoolApi";
import _ from "lodash";
import { VIETMAP_API_KEY } from "@env";
import { useAuth } from "../../provider/AuthProvider";

const CustomPicker = ({
  options,
  selectedValue,
  onValueChange,
  placeholder,
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (value) => {
    onValueChange(value);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={() => setVisible(true)}>
        <Text
          style={selectedValue ? styles.selectedText : styles.placeholderText}
        >
          {selectedValue || placeholder}
        </Text>
      </TouchableOpacity>
      {visible && (
        <Modal visible={visible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setVisible(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const CustomDateTimePicker = ({
  options,
  selectedValue,
  onValueChange,
  placeholder,
  mode = "date", // 'date' hoặc 'time'
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (value) => {
    onValueChange(value); // Giá trị phải là chuỗi
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={() => setVisible(true)}>
        <Text
          style={selectedValue ? styles.selectedText : styles.placeholderText}
        >
          {typeof selectedValue === "string" ? selectedValue : placeholder}
        </Text>
      </TouchableOpacity>
      {visible && (
        <Modal visible={visible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {mode === "date" ? "Chọn ngày" : "Chọn giờ"}
              </Text>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setVisible(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export const CarpoolRequestScreen = ({ navigation, route }) => {
  const { serviceId } = route.params;
  const [locationDetail, setLocationDetail] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeStart, setTimeStart] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [price, setPrice] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { authState } = useAuth();

  const centralProvinces = [
    { label: "Hà Tĩnh", value: "Hà Tĩnh", lat: 18.3389, lng: 105.911 },
    { label: "Quảng Bình", value: "Quảng Bình", lat: 17.49, lng: 106.5984 },
    { label: "Quảng Trị", value: "Quảng Trị", lat: 16.7425, lng: 107.3383 },
    {
      label: "Thừa Thiên Huế",
      value: "Thừa Thiên Huế",
      lat: 16.4637,
      lng: 107.5909,
    },
    { label: "Đà Nẵng", value: "Đà Nẵng", lat: 16.0471, lng: 108.2062 },
    { label: "Quảng Nam", value: "Quảng Nam", lat: 15.8794, lng: 108.335 },
    { label: "Quảng Ngãi", value: "Quảng Ngãi", lat: 15.1214, lng: 108.8046 },
    { label: "Bình Định", value: "Bình Định", lat: 13.782, lng: 109.202 },
    { label: "Phú Yên", value: "Phú Yên", lat: 13.0841, lng: 109.3057 },
    { label: "Khánh Hòa", value: "Khánh Hòa", lat: 12.2523, lng: 109.1967 },
    { label: "Ninh Thuận", value: "Ninh Thuận", lat: 11.6, lng: 108.9333 },
    { label: "Bình Thuận", value: "Bình Thuận", lat: 10.9281, lng: 108.0965 },
  ];

  // Tính khoảng cách giữa 2 thành phố
  const haversineDistance = (coords1, coords2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Bán kính Trái đất (km)
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coords1.lat)) *
        Math.cos(toRad(coords2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Khoảng cách tính bằng km
  };

  const calculatePrice = (distance, serviceId) => {
    let pricePerKm;

    // Kiểm tra serviceId và gán giá per km tương ứng
    switch (serviceId) {
      case "67414fb314fada16bde3ada7":
        pricePerKm = 10000; // Giá cho serviceId = "67414fb314fada16bde3ada7"
        break;
      case "67414fbd14fada16bde3adaa":
        pricePerKm = 13000; // Giá cho serviceId = "67414fbd14fada16bde3adaa"
        break;
      case "67414fe614fada16bde3adad":
        pricePerKm = 15000; // Giá cho serviceId = "67414fe614fada16bde3adad"
        break;
      default:
        pricePerKm = 10000; // Giá mặc định nếu không khớp với bất kỳ serviceId nào
    }
    console.log("pricePerKm: ", pricePerKm);
    console.log("serviceId: ", serviceId);
    // Tính giá dựa trên khoảng cách và giá per km
    return Math.round(distance * pricePerKm); // Làm tròn đến hàng đơn vị
  };

  useEffect(() => {
    if (startLocation && endLocation) {
      const startProvince = centralProvinces.find(
        (province) => province.value === startLocation
      );
      const endProvince = centralProvinces.find(
        (province) => province.value === endLocation
      );

      if (startProvince && endProvince) {
        const distance = haversineDistance(
          { lat: startProvince.lat, lng: startProvince.lng },
          { lat: endProvince.lat, lng: endProvince.lng }
        );

        const estimatedPrice = calculatePrice(distance, serviceId);
        setPrice(estimatedPrice.toString());
      }
    }
  }, [startLocation, endLocation]);

  // Debounce để tránh gọi API liên tục
  const fetchPredictions = useCallback(
    _.debounce(async (input) => {
      if (input.length < 3) {
        setPredictions([]);
        return;
      }

      const query = startLocation ? `${input}, ${startLocation}` : input;
      const url = `https://maps.vietmap.vn/api/autocomplete/v3?apikey=${VIETMAP_API_KEY}&text=${encodeURIComponent(
        query
      )}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
          setPredictions(data);
        }
      } catch (error) {
        console.error("Error fetching predictions: ", error);
        setPredictions([]);
      }
    }, 2000),
    [startLocation]
  );

  const handleLocationDetailChange = (text) => {
    setLocationDetail(text);
    setIsInputFocused(true);
    fetchPredictions(text);
  };

  const handlePredictionSelect = (prediction) => {
    console.log("Handle prediction:", prediction);
    setLocationDetail(prediction.display);
    setSelectedLocation(prediction);
    setPredictions([]);
    setIsInputFocused(false);
    Keyboard.dismiss(); // Ẩn bàn phím khi chọn gợi ý
  };

  const isValidTime = (selectedTime) => {
    const hour = selectedTime.getHours();
    return hour >= 5 && hour < 20; // Cho phép từ 5:00 sáng đến 19:59 tối
  };

  const handleCreateRequest = async () => {
    console.log("work api ");

    if (
      !locationDetail ||
      !startLocation ||
      !endLocation ||
      !date ||
      !timeStart
    ) {
      Alert.alert(
        "Lỗi",
        "Vui lòng điền đầy đủ thông tin trước khi tạo yêu cầu."
      );
      return;
    }

    // if (!isValidTime(timeStart)) {
    //   Alert.alert('Lỗi', 'Chúng tôi chưa phục vụ chuyến từ 20h đến 5h. Vui lòng chọn lại');
    //   return;
    // }

    let longitudeVariable = "";
    let latitudeVariable = "";
    if (selectedLocation?.ref_id) {
      const placeUrl = `https://maps.vietmap.vn/api/place/v3?apikey=${VIETMAP_API_KEY}&refid=${selectedLocation.ref_id}`;
      try {
        const placeResponse = await fetch(placeUrl);
        const placeData = await placeResponse.json();
        if (placeData && placeData.lat && placeData.lng) {
          const requestData = {
            location: locationDetail,
            longitude: placeData.lng,
            latitude: placeData.lat,
            start_location: startLocation,
            end_location: endLocation,
            date: date.toISOString().split("T")[0], // Formats date as "YYYY-MM-DD"
            time_start: timeStart, // Assumes timeStart is already in "HH:mm" format
            price,
            service_option_id: serviceId,
          };
          console.log("🚀 ~ handleCreateRequest ~ requestData:", requestData);

          longitudeVariable = placeData.lng;
          latitudeVariable = placeData.lat;

          const currentDate = new Date();
          const inputDate = new Date(
            `${date.toISOString().split("T")[0]}T${timeStart}:00` // Combine date and timeStart into ISO format
          );

          // Calculate the time difference between inputDate and currentDate in milliseconds
          const timeDifference = inputDate.getTime() - currentDate.getTime();

          // Convert 4 hours to milliseconds
          const fourHoursInMillis = 4 * 60 * 60 * 1000;

          // Check if the time difference is less than 4 hours
          if (timeDifference < fourHoursInMillis) {
            Alert.alert(
              "Lỗi",
              "Ngày và giờ đi phải cách thời gian hiện tại ít nhất 4 giờ."
            );
            return;
          }
          const response = await createCarpoolRequest(
            requestData,
            authState.token
          );
          if (response.data.allowCreateNew) {
            navigation.navigate("Sucessfull");
          }
        }
      } catch (error) {
        if (
          error.response.data.message ==
          "You are already part of another ride on this date that is ongoing or pending."
        ) {
          Alert.alert(
            "Lỗi",
            "Bạn có 1 chuyến khác chưa hoàn thành. Vui lòng kiểm tra lại"
          );
          return;
        }
        if (
          error.response.data.message ==
          "You already have a similar pending request for this ride within ±1 hours."
        ) {
          const searchParams = {
            start_location: startLocation,
            location: locationDetail,
            longitude: longitudeVariable,
            latitude: latitudeVariable,
            end_location: endLocation,
            date: date.toISOString().split("T")[0], // Ngày định dạng yyyy-mm-dd
            time_start: timeStart.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }), // Giờ khởi hành
            service_id: serviceId, // Nếu cần lọc theo dịch vụ
          };

          Alert.alert(
            "Thông báo",
            "Có 1 chuyến tương tự đã được tạo, hãy tham gia nó nhé"
          );
          navigation.navigate("AvailableRides", { searchParams });
          return;
        }
        Alert.alert("Lỗi", "Lỗi không thể tạo.");
      }
    } else {
      Alert.alert("Lỗi", "Không tìm thấy vị trí cụ thể. Vui lòng chọn lại.");
    }
  };

  const handleFindRequest = async () => {
    const searchParams = {
      start_location: startLocation,
      location: locationDetail,
      longitude: placeData.lng,
      latitude: placeData.lat,
      end_location: endLocation,
      date: date.toISOString().split("T")[0], // Ngày định dạng yyyy-mm-dd
      time_start: timeStart.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }), // Giờ khởi hành
      service_id: serviceId, // Nếu cần lọc theo dịch vụ
    };

    navigation.navigate("AvailableRides", { searchParams });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Điểm đi</Text>
        <CustomPicker
          options={centralProvinces.map((province) => ({
            label: province.label,
            value: province.value,
          }))}
          selectedValue={startLocation}
          onValueChange={setStartLocation}
          placeholder="Di chuyển từ..."
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Điểm đón cụ thể</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập địa chỉ cụ thể..."
          value={locationDetail}
          onChangeText={handleLocationDetailChange}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />

        {predictions.length > 0 && (
          <ScrollView style={styles.suggestionContainer}>
            {predictions.map((prediction, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePredictionSelect(prediction)}
                style={styles.suggestionItem}
              >
                <Text>{prediction.display}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Điểm đến</Text>
        <CustomPicker
          options={centralProvinces.map((province) => ({
            label: province.label,
            value: province.value,
          }))}
          selectedValue={endLocation}
          onValueChange={setEndLocation}
          placeholder="Chọn điểm đến..."
        />
      </View>

      <CustomDateTimePicker
        mode="date"
        options={[...Array(30)].map((_, index) => {
          const dateOption = new Date();
          dateOption.setDate(dateOption.getDate() + index);
          return {
            label: dateOption.toLocaleDateString("vi-VN"),
            value: dateOption.toISOString().split("T")[0], // Chuỗi ISO ngày
          };
        })}
        selectedValue={date.toLocaleDateString("vi-VN")}
        onValueChange={(selectedDate) => setDate(new Date(selectedDate))}
        placeholder="Chọn ngày"
      />

      <CustomDateTimePicker
        mode="time"
        options={[...Array(11)].map((_, index) => {
          const hour = 7 + index;
          const timeOption = `${hour}:00`;
          return {
            label: timeOption, // Chuỗi hiển thị
            value: timeOption, // Chuỗi giờ
          };
        })}
        selectedValue={timeStart}
        onValueChange={(selectedTime) => setTimeStart(selectedTime)}
        placeholder="Chọn giờ"
      />

      <View style={styles.formGroup}>
        <Text style={styles.label}>Giá dự kiến</Text>
        <Text style={styles.priceText}>
          {Number(price).toLocaleString("vi-VN")} VNĐ
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCreateRequest}>
          <Text style={styles.buttonText}>Tạo yêu cầu</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleFindRequest}>
          <Text style={styles.buttonText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  suggestionContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    maxHeight: 150,
    marginTop: 5,
    paddingHorizontal: 10,
  },
  suggestionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateTimeGroup: {
    flex: 1,
    marginRight: 10,
  },
  dateTimeInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    fontSize: 16,
  },
  dateTimeText: {
    fontSize: 16,
    color: "#333",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4caf50", // Màu xanh lá cho giá
    textAlign: "right",
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  customPickerInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  customPickerText: {
    fontSize: 16,
    color: "#333",
  },
  customPickerPlaceholder: {
    fontSize: 16,
    color: "#888",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    marginBottom: 10,
  },
  selectedText: {
    color: "#333",
    fontSize: 16,
  },
  placeholderText: {
    color: "#888",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "60%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    width: "100%",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
