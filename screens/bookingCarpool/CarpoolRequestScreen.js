import React, { useState, useCallback, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView, Keyboard } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createCarpoolRequest } from '../../service/BookingCarpoolApi';
import _ from 'lodash';
import { VIETMAP_API_KEY } from '@env';
import { useAuth } from "../../provider/AuthProvider";

export const CarpoolRequestScreen = ({ navigation, route }) => {
  const { serviceId } = route.params; 
  const [locationDetail, setLocationDetail] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeStart, setTimeStart] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [price, setPrice] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { authState } = useAuth();

  const centralProvinces = [
    { label: 'Hà Tĩnh', value: 'Hà Tĩnh', lat: 18.3389, lng: 105.9110 },
    { label: 'Quảng Bình', value: 'Quảng Bình', lat: 17.4900, lng: 106.5984 },
    { label: 'Quảng Trị', value: 'Quảng Trị', lat: 16.7425, lng: 107.3383 },
    { label: 'Thừa Thiên Huế', value: 'Thừa Thiên Huế', lat: 16.4637, lng: 107.5909 },
    { label: 'Đà Nẵng', value: 'Đà Nẵng', lat: 16.0471, lng: 108.2062 },
    { label: 'Quảng Nam', value: 'Quảng Nam', lat: 15.8794, lng: 108.3350 },
    { label: 'Quảng Ngãi', value: 'Quảng Ngãi', lat: 15.1214, lng: 108.8046 },
    { label: 'Bình Định', value: 'Bình Định', lat: 13.7820, lng: 109.2020 },
    { label: 'Phú Yên', value: 'Phú Yên', lat: 13.0841, lng: 109.3057 },
    { label: 'Khánh Hòa', value: 'Khánh Hòa', lat: 12.2523, lng: 109.1967 },
    { label: 'Ninh Thuận', value: 'Ninh Thuận', lat: 11.6000, lng: 108.9333 },
    { label: 'Bình Thuận', value: 'Bình Thuận', lat: 10.9281, lng: 108.0965 }
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
    console .log("pricePerKm: ",pricePerKm)
    console .log("serviceId: ",serviceId)
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
      const url = `https://maps.vietmap.vn/api/autocomplete/v3?apikey=${VIETMAP_API_KEY}&text=${encodeURIComponent(query)}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
          setPredictions(data);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
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
    console.log('Handle prediction:', prediction);
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

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      if (isValidTime(selectedTime)) {
        setTimeStart(selectedTime);
      } else {
        Alert.alert(
          'Thời gian không hợp lệ',
          'Vui lòng chọn thời gian từ 5:00 sáng đến 20:00 tối',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleCreateRequest = async () => {
    if (!locationDetail || !startLocation || !endLocation || !date || !timeStart) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin trước khi tạo yêu cầu.');
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
            date: date.toISOString().split('T')[0],
            time_start: timeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price,
            service_option_id: serviceId,
          };
          longitudeVariable = placeData.lng;
          latitudeVariable = placeData.lat;

          const currentDate = new Date();
          const inputDate = new Date(
            date.toISOString().split('T')[0] + 'T' + timeStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ':00'
          );

          const timeDifference = inputDate - currentDate; // Khoảng cách thời gian giữa inputDate và currentDate (miligiây)

          // Chuyển đổi 4 giờ thành miligiây (4 * 60 * 60 * 1000)
          const fourHoursInMillis = 4 * 60 * 60 * 1000;

          // Kiểm tra nếu sự chênh lệch nhỏ hơn 4 giờ
          if (timeDifference < fourHoursInMillis) {
            Alert.alert('Lỗi', 'Ngày và giờ đi phải cách thời gian hiện tại ít nhất 4 giờ.');
            return;
          }
          const response = await createCarpoolRequest(requestData, authState.token);
          if (response.data.allowCreateNew) {
            navigation.navigate('Sucessfull');
          }
        }
      } catch (error) {
        if (error.response.data.message == "You are already part of another ride on this date that is ongoing or pending.") {
          Alert.alert('Lỗi', 'Bạn có 1 chuyến khác chưa hoàn thành. Vui lòng kiểm tra lại');
        }
        if (error.response.data.message == "You already have a similar pending request for this ride within ±1 hours.") {
          const searchParams = {
            start_location: startLocation,
            location: locationDetail,
            longitude: longitudeVariable,
            latitude: latitudeVariable,
            end_location: endLocation,
            date: date.toISOString().split('T')[0], // Ngày định dạng yyyy-mm-dd
            time_start: timeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Giờ khởi hành
            service_id: serviceId, // Nếu cần lọc theo dịch vụ
          };

          Alert.alert('Thông báo', 'Có 1 chuyến tương tự đã được tạo, hãy tham gia nó nhé');
          navigation.navigate('AvailableRides', { searchParams });
        }
      }
    } else {
      Alert.alert('Lỗi', 'Không tìm thấy vị trí cụ thể. Vui lòng chọn lại.');
    }
  };

  const handleFindRequest = async () => {
    const searchParams = {
      start_location: startLocation,
      location: locationDetail,
      longitude: placeData.lng,
      latitude: placeData.lat,
      end_location: endLocation,
      date: date.toISOString().split('T')[0], // Ngày định dạng yyyy-mm-dd
      time_start: timeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Giờ khởi hành
      service_id: serviceId, // Nếu cần lọc theo dịch vụ
    };

    navigation.navigate('AvailableRides', { searchParams });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Điểm đi</Text>
        <RNPickerSelect
          onValueChange={setStartLocation}
          items={centralProvinces}
          value={startLocation || ''}
          style={pickerSelectStyles}
          placeholder={{ label: 'Di chuyển từ...', value: '' }}
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
        <RNPickerSelect
          onValueChange={setEndLocation}
          items={centralProvinces}
          value={endLocation || ''}
          style={pickerSelectStyles}
          placeholder={{ label: 'Chọn điểm đến...', value: '' }}
        />
      </View>

      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeGroup}>
          <Text style={styles.label}>Ngày đi</Text>
          <TouchableOpacity
            style={styles.dateTimeInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeText}>
              {date.toLocaleDateString() || 'Chọn ngày'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateTimeGroup}>
          <Text style={styles.label}>Giờ đi</Text>
          <TouchableOpacity
            style={styles.dateTimeInput}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeText}>
              {timeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Chọn giờ'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={timeStart}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setTimeStart(selectedTime);
            }
          }}
        />
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Giá dự kiến</Text>
        <Text style={styles.priceText}>
          {Number(price).toLocaleString('vi-VN')} VNĐ
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
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateTimeGroup: {
    flex: 0.48,
  },
  dateTimeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    height: 48,
    justifyContent: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  suggestionContainer: {
    maxHeight: 150,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#28a745',
    padding: 12,
    backgroundColor: '#e9f7ef',
    borderRadius: 8,
    height: 50,
    lineHeight: 24,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#fff',
    height: 55,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#fff',
    height: 48,
  },
});