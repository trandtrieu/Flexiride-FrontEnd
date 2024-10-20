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
      console.error('Failed to fetch rides:', error);
      Alert.alert('Error', 'Unable to load rides. Please try again later.');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await cancelCarpoolRequest(requestId);
      Alert.alert('Success', 'Ride request canceled successfully.');
      fetchCustomerRides(); 
    } catch (error) {
      console.error('Error canceling request:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={rides}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Từ: {item.start_location}</Text>
            <Text>Đến: {item.end_location}</Text>
            <Text>Ngày xuất phát: {new Date(item.date).toLocaleDateString()}</Text>
            <Text>Thời gian khởi hành: {(item.time_start)}</Text>
            <Text>Trạng thái: {item.status}</Text>
            <Text>{item.price / (item.customer || 1)} VNĐ mỗi khách</Text>

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
    backgroundColor: '#f0f2f5', // Softer background for better contrast
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
    borderColor: '#ddd', // Subtle border for better separation
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: '#ff4d4f', // A brighter red for a more modern touch
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600', // Semi-bold for better readability
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 30,
    fontStyle: 'italic', // Adds a more empathetic feel to the empty state message
  },
  rideDetails: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  priceText: {
    fontSize: 16,
    color: '#28a745', // Green to signify the cost positively
    fontWeight: '600',
  },
});


export default ManageBookingScreen;
