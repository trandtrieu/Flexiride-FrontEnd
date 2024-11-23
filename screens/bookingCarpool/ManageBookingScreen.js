import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useFocusEffect } from '@react-navigation/native';
import { getCustomerRides, cancelCarpoolRequest } from '../../service/BookingCarpoolApi';

export const ManageBookingScreen = ({ navigation }) => {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Gọi API để tải danh sách chuyến đi mỗi khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      fetchCustomerRides();
    }, [])
  );

  // Gọi API để tải danh sách chuyến đi
  const fetchCustomerRides = async () => {
    try {
      const response = await getCustomerRides();
      const sortedRides = response.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setRides(sortedRides);
      setFilteredRides(sortedRides);
    } catch (error) {
      console.error('Error fetching rides:', error);
      Alert.alert('Error', 'Không thể tải danh sách chuyến đi.');
    }
  };

  // Bộ lọc chuyến đi theo ngày và trạng thái
  const filterRides = () => {
    let result = [...rides];

    if (dateFilter) {
      result = result.filter(
        (ride) =>
          new Date(ride.date).toLocaleDateString() ===
          new Date(dateFilter).toLocaleDateString()
      );
    }

    if (statusFilter) {
      result = result.filter((ride) => ride.status === statusFilter);
    }

    setFilteredRides(result);
  };

  // Gọi bộ lọc mỗi khi bộ lọc hoặc danh sách chuyến đi thay đổi
  useEffect(() => {
    filterRides();
  }, [dateFilter, statusFilter, rides]);

  // Hủy chuyến đi
  const handleCancelRequest = async (requestId) => {
    try {
      await cancelCarpoolRequest(requestId);
      Alert.alert('Success', 'Ride request canceled successfully.');
      fetchCustomerRides();
    } catch (error) {
      console.error('Error cancelling request:', error);
      Alert.alert('Error', 'Unable to cancel the request.');
    }
  };

  // Chuyển đến màn hình phản hồi
  const handleFeedbackNavigation = (ride) => {
    navigation.navigate('FeedbackScreen', { ride });
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="YYYY-MM-DD"
          value={dateFilter}
          onChangeText={setDateFilter}
        />
        <Picker
          style={styles.statusPicker}
          selectedValue={statusFilter}
          onValueChange={(itemValue) => setStatusFilter(itemValue)}
        >
          <Picker.Item label="Tất cả trạng thái" value="" />
          <Picker.Item label="Pending" value="pending" />
          <Picker.Item label="Complete" value="completed" />
          <Picker.Item label="Ongoing" value="ongoing" />
          <Picker.Item label="Done" value="done" />
        </Picker>
      </View>

      {/* Danh sách chuyến đi */}
      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.rideDetails}>Từ: {item.start_location}</Text>
            <Text style={styles.rideDetails}>Đến: {item.end_location}</Text>
            <Text style={styles.rideDetails}>
              Ngày xuất phát: {new Date(item.date).toLocaleDateString()}
            </Text>
            <Text style={styles.rideDetails}>
              Thời gian khởi hành: {item.time_start}
            </Text>
            <Text style={styles.rideDetails}>Trạng thái: {item.status}</Text>

            {item.status === 'pending' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelRequest(item._id)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            )}

            {item.status === 'completed' && (
              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={() => handleFeedbackNavigation(item)}
              >
                <Text style={styles.feedbackButtonText}>Phản hồi</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có chuyến xe nào</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  statusPicker: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: '#ff4d4f',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  feedbackButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 30,
    fontStyle: 'italic',
  },
  rideDetails: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
});

export default ManageBookingScreen;
