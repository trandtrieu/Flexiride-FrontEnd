import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createCarpoolRequest } from '../../service/BookingCarpoolApi';

export const CarpoolRequestScreen = ({ navigation }) => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeStart, setTimeStart] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [price, setPrice] = useState('500000');

  const centralProvinces = [
    { label: 'Đà Nẵng', value: 'Đà Nẵng' },
    { label: 'Thừa Thiên Huế', value: 'Thừa Thiên Huế' },
    { label: 'Quảng Nam', value: 'Quảng Nam' },
    { label: 'Quảng Ngãi', value: 'Quảng Ngãi' },
    { label: 'Bình Định', value: 'Bình Định' },
    { label: 'Phú Yên', value: 'Phú Yên' },
    { label: 'Khánh Hòa', value: 'Khánh Hòa' },
    { label: 'Ninh Thuận', value: 'Ninh Thuận' },
    { label: 'Quảng Bình', value: 'Quảng Bình' },
    { label: 'Quảng Trị', value: 'Quảng Trị' },
  ];

  const handleCreateRequest = async () => {
    const requestData = {
      start_location: startLocation,
      end_location: endLocation,
      date: date.toISOString().split('T')[0],
      time_start: timeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price,
    };
    try {
      const response = await createCarpoolRequest(requestData);
      if (response.data.allowCreateNew) {
        navigation.navigate('Sucessfull');
      }
    } catch (error) {
      if (error.response?.data?.message === "You already have a similar pending request for this ride within ±1 hours.") {
        Alert.alert(
          'Yêu cầu đã tồn tại',
          'Yêu cầu tương tự đã tồn tại trong hệ thống. Chúng tôi sẽ hiển thị các chuyến đi tương tự để bạn lựa chọn.',
          [{ text: 'OK', onPress: () => navigation.navigate('AvailableRides', { searchParams: requestData }) }]
        );
      } else {
        Alert.alert(
          'Lỗi',
          'Không thể tạo yêu cầu. Chúng tôi sẽ hiển thị các chuyến đi tương tự để bạn lựa chọn.',
          [{ text: 'OK', onPress: () => navigation.navigate('AvailableRides', { searchParams: requestData }) }]
        );
      }
    }
  };

  const handleFindRequest = () => {
    const requestData = {
      start_location: startLocation,
      end_location: endLocation,
      date: date.toISOString().split('T')[0],
      time_start: timeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price,
    };
    navigation.navigate('AvailableRides', { searchParams: requestData });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Điểm đón"
        value={startLocation}
        onChangeText={setStartLocation}
      />

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
        <TouchableOpacity style={styles.button} onPress={handleFindRequest}>
          <Text style={styles.buttonText}>Tìm kiếm</Text>
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
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
