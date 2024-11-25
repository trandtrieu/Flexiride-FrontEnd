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
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome'

import { useFocusEffect } from '@react-navigation/native';
import { getCustomerRides, cancelCarpoolRequest } from '../../service/BookingCarpoolApi';

export const ManageBookingScreen = ({ navigation }) => {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

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
        (ride) => new Date(ride.date).setHours(0, 0, 0, 0) >= new Date(dateFilter).setHours(0, 0, 0, 0)
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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Ẩn DateTimePicker
    if (selectedDate) {
      setDateFilter(selectedDate); // Cập nhật ngày lọc
    }
  };

  // Chuyển đến màn hình phản hồi
  const handleFeedbackNavigation = (ride) => {
    navigation.navigate('FeedbackScreen', { ride });
  };

  const getVehicleName = (serviceId) => {
    const vehicleMap = {
      '67414fb314fada16bde3ada7': 'Xe 4 chỗ',
      '67414fbd14fada16bde3adaa': 'Xe 7 chỗ',
      '67414fe614fada16bde3adad': 'Limousine',
    };
    return serviceId ? vehicleMap[serviceId] || 'Phương tiện không xác định' : 'Phương tiện không xác định';
  };

  const getVehicleCapacity = (serviceId) => {
    const capacityMap = {
      '67414fb314fada16bde3ada7': 4,
      '67414fbd14fada16bde3adaa': 7,
      '67414fe614fada16bde3adad': 7,
    };
    return capacityMap[serviceId] || 'N/A';
  };


  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { color: '#FFA500', fontWeight: 'bold', textTransform: 'uppercase' };
      case 'completed':
        return { color: '#4CAF50', fontWeight: 'bold', textTransform: 'uppercase' };
      case 'ongoing':
        return { color: '#1E90FF', fontWeight: 'bold', textTransform: 'uppercase' };
      case 'done':
        return { color: '#9E9E9E', fontWeight: 'bold', textTransform: 'uppercase' };
      default:
        return { color: '#333', fontWeight: 'normal', textTransform: 'capitalize' };
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: dateFilter ? '#333' : '#888' }}>
            {dateFilter
              ? new Date(dateFilter).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
              : 'Chọn ngày'}
          </Text>
        </TouchableOpacity>
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

      {showDatePicker && (
        <DateTimePicker
          value={dateFilter || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Danh sách chuyến đi */}
      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const maxCapacity = getVehicleCapacity(item.service_option_id);
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.leftColumn}>
                  <Text style={styles.rideDetails}>Từ: {item.start_location}</Text>
                  <Text style={styles.rideDetails}>Đến: {item.end_location}</Text>
                  <Text style={styles.rideDetails}>
                    Ngày xuất phát: {new Date(item.date).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.rideDetails}>
                    Thời gian khởi hành: {item.time_start}
                  </Text>
                  <Text style={styles.rideDetails}>
                    Phương tiện: {getVehicleName(item.service_option_id)}
                  </Text>
                  <Text style={styles.rideDetails}>
                    Trạng thái: <Text style={getStatusStyle(item.status)}>{item.status}</Text>
                  </Text>
                </View>
                <View style={styles.rightColumn}>
                  <Icon name="user" size={20} color="#888" />
                  <Text style={styles.passengerCount}>
                    {item.customerCount} / {maxCapacity}
                  </Text>
                </View>
              </View>
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
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có chuyến xe nào</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafc', // Màu nền sáng nhẹ
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    fontSize: 16,
    color: '#333',
  },
  statusPicker: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  rideDetails: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    lineHeight: 22, // Cải thiện khả năng đọc
  },
  cancelButton: {
    backgroundColor: '#ff4d4f', // Đỏ nổi bật
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase', // Chữ in hoa
  },
  feedbackButton: {
    backgroundColor: '#4caf50', // Xanh lá nổi bật
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  feedbackButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase', // Chữ in hoa
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 30,
    fontStyle: 'italic',
  },
  passengerCount: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    color: '#555',
    textAlign: 'center', // Căn giữa nội dung
  },
  rightColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row', // Đặt icon và text cạnh nhau
    gap: 5, // Khoảng cách giữa icon và text
  },
  
});
