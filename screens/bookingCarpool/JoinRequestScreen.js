import React, { useState, useCallback, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView, Keyboard } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { VIETMAP_API_KEY } from '@env';
import { useAuth } from "../../provider/AuthProvider";
import _ from 'lodash';
import { joinCarpoolRequest } from '../../service/BookingCarpoolApi';

export const JoinRequestScreen = ({ navigation, route }) => {
  const { requestId } = route.params;
  const [locationDetail, setLocationDetail] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { authState } = useAuth();

  // Debounce to avoid continuous API calls
  const fetchPredictions = useCallback(
    _.debounce(async (input) => {
      if (input.length < 3) {
        setPredictions([]);
        return;
      }

      const query = input;
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
    []
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
    Keyboard.dismiss(); // Hide the keyboard when selecting a suggestion
  };

  const handleJoinRequest = async () => {
    if (!locationDetail) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ đón.');
      return;
    }

    if (!selectedLocation?.ref_id) {
      Alert.alert('Lỗi', 'Không tìm thấy vị trí cụ thể. Vui lòng chọn lại.');
      return;
    }

    const placeUrl = `https://maps.vietmap.vn/api/place/v3?apikey=${VIETMAP_API_KEY}&refid=${selectedLocation.ref_id}`;
    try {
      const placeResponse = await fetch(placeUrl);
      const placeData = await placeResponse.json();

      if (placeData && placeData.lat && placeData.lng) {
        const requestData = {
          location: locationDetail,
          longitude: placeData.lng,
          latitude: placeData.lat,
        };

        // Handle the join request logic here (e.g., call API, handle response)
        console.log('Request data:', requestData);
        console.log('requestId:', requestId);
        console.log('authState.token:', authState.token);
        await joinCarpoolRequest(requestId, requestData, authState.token);

        // Navigate to the next screen upon successful request
        navigation.navigate('Sucessfull');
      } else {
        Alert.alert('Lỗi', 'Không thể lấy thông tin vị trí.');
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      Alert.alert('Lỗi', 'Lỗi không xác định.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Vị trí đón</Text>
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleJoinRequest}>
          <Text style={styles.buttonText}>Tham gia yêu cầu</Text>
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
});
