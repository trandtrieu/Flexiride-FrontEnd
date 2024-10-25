import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getCustomerRides, cancelCarpoolRequest } from '../../service/BookingCarpoolApi';

export const ManageBookingScreen = ({ navigation }) => {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    fetchCustomerRides();
  }, []);

  const fetchCustomerRides = async () => {
    try {
      const response = await getCustomerRides();
      setRides(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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

  return (
    <View style={styles.container}>
      <FlatList
        data={rides}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.rideDetails}>Từ: {item.start_location}</Text>
            <Text style={styles.rideDetails}>Đến: {item.end_location}</Text>
            <Text style={styles.rideDetails}>Ngày xuất phát: {new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.rideDetails}>Thời gian khởi hành: {formatTime(item.time_start)}</Text>
            <Text style={styles.rideDetails}>Trạng thái: {item.status}</Text>
            <Text style={styles.priceText}>
              {formatCurrency(item.price / (item.customer || 1))} mỗi khách
            </Text>

            {item.status === "pending" && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelRequest(item._id)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
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
  priceText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 10,
  },
});

export default ManageBookingScreen;
