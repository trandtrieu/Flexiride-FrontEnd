import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView, Keyboard } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createCarpoolRequest } from '../../service/BookingCarpoolApi';
import _ from 'lodash';
import { VIETMAP_API_KEY } from '@env';

export const CarpoolRequestScreen = ({ navigation, route }) => {
  const { serviceId } = route.params; // Nhận serviceId từ navigation
  const [locationDetail, setLocationDetail] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeStart, setTimeStart] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [price, setPrice] = useState('800000');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Set cứng tọa độ
  const longitude = 108.22787; // Ví dụ: Tọa độ của Đà Nẵng
  const latitude = 16.061074; // Ví dụ: Tọa độ của Đà Nẵng

  const centralProvinces = [
    { label: 'Đà Nẵng', value: 'Đà Nẵng' },
    { label: 'Thừa Thiên Huế', value: 'Thừa Thiên Huế' },
    { label: 'Quảng Nam', value: 'Quảng Nam' },
    { label: 'Quảng Ngãi', value: 'Quảng Ngãi' },
  ];

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

  const handleCreateRequest = async () => {
    if (!locationDetail || !startLocation || !endLocation || !date || !timeStart || !price) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin trước khi tạo yêu cầu.');
      return;
    }

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
          };

          const response = await createCarpoolRequest(requestData);
          if (response.data.allowCreateNew) {
            navigation.navigate('Sucessfull');
          }
        }
      } catch (error) {
        console.error('Error creating carpool request:', error);
        Alert.alert('Lỗi', 'Không thể tạo yêu cầu.');
      }
    } else {
      Alert.alert('Lỗi', 'Không tìm thấy vị trí cụ thể. Vui lòng chọn lại.');
    }
  };

  return (
    <View style={styles.container}>
      <RNPickerSelect
        onValueChange={setStartLocation}
        items={centralProvinces}
        value={startLocation || ''}
        style={pickerSelectStyles}
        placeholder={{ label: 'Di chuyển từ...', value: '' }}
      />

      <TextInput
        style={styles.input}
        placeholder="Điểm đón cụ thể..."
        value={locationDetail}
        onChangeText={handleLocationDetailChange}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
      />

      {/* Hiển thị khung gợi ý chỉ khi đang nhập */}
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

      <RNPickerSelect
        onValueChange={setEndLocation}
        items={centralProvinces}
        value={endLocation || ''}
        style={pickerSelectStyles}
        placeholder={{ label: 'Chọn điểm đến...', value: '' }}
      />

      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.text}>
          {date.toLocaleDateString() || 'Chọn ngày'}
        </Text>
      </TouchableOpacity>
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

      <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.text}>
          {timeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Chọn giờ'}
        </Text>
      </TouchableOpacity>
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

      <TextInput
        style={styles.input}
        placeholder="Giá tiền"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCreateRequest}>
          <Text style={styles.buttonText}>Tạo yêu cầu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  suggestionContainer: {
    maxHeight: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 15,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 10,
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
    marginBottom: 15,
    backgroundColor: '#fff',
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
    marginBottom: 15,
    backgroundColor: '#fff',
  },
});

export default CarpoolRequestScreen;
