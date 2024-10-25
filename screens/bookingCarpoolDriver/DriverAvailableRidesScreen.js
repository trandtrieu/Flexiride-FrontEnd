// screens/DriverAvailableRidesScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { getDriverAvailableRides, acceptCarpoolRequest } from '../../service/BookingCarpoolApi';

export const DriverAvailableRidesScreen = ({ navigation }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await getDriverAvailableRides();
      setRides(response.data);
    } catch (error) {
      console.error('Error fetching available rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setAccepting(requestId);
    try {
      console.log("RequestID: ", requestId);
      await acceptCarpoolRequest(requestId);
      navigation.navigate('ManageDriverRides');
    } catch (error) {
      console.error('Error accepting the request:', error);
    } finally {
      setAccepting(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading available rides...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {rides.length === 0 ? (
        <Text style={styles.noRidesText}>No available rides at the moment.</Text>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item, index) => item.id ? item.id : index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.rideInfo}>Đi từ: {item.start_location}</Text>
              <Text style={styles.rideInfo}>Đến: {item.end_location}</Text>
              <Text style={styles.rideInfo}>Ngày Xuất phát: {formatDate(item.date)}</Text>
              <Text style={styles.rideInfo}>Thời gian xuất phát: {formatTime(item.time_start)}</Text>
              <Text style={styles.rideInfo}>Giá: {formatPrice(item.price)} VNĐ</Text>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptRequest(item.id)}
                disabled={accepting === item.id}
              >
                <Text style={styles.buttonText}>
                  {accepting === item.id ? 'Processing...' : 'Nhận chuyến'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  noRidesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rideInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
