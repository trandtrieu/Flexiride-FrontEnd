import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDriverLocation, getCustomerLocation } from '../../service/BookingCarpoolApi';
import { useAuth } from "../../provider/AuthProvider";

const RideDetailScreen = ({ route, navigation }) => {
  const { ride } = route.params;
  const [location, setLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const { authState } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      if (ride.driver && ride.driver.driverId) {
        fetchDriverLocation(ride.driver.driverId);
        fetchCustomerLocation();
      }
    }, [ride.driver])
  );

  const fetchDriverLocation = async (driverId) => {
    try {
      const response = await getDriverLocation(driverId, authState.token);
      setLocation(response.data);
    } catch (error) {
      console.error('Error fetching driver location:', error);
      Alert.alert('Error', 'Không thể tải vị trí tài xế.');
    }
  };

  const fetchCustomerLocation = async () => {
    try {
      const response = await getCustomerLocation(ride._id,  authState.token);
      setCustomerLocation(response.data[0]);
    } catch (error) {
      console.error('Error fetching customer location:', error);
      Alert.alert('Error', 'Không thể tải vị trí khách hàng.');
    }
  };

  const handleRoute = async () => {
    const driverCoordinates = {
      latitude: parseFloat(location.location.coordinates[1]),
      longitude: parseFloat(location.location.coordinates[0]),
    };
    const customerCoordinates = {
      latitude: parseFloat(customerLocation.latitude),
      longitude: parseFloat(customerLocation.longitude),
    };
    navigation.navigate('SingleRoute', {
      driverCoordinates,
      customerCoordinates,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thông tin chi tiết chuyến đi</Text>
      <View style={styles.card}>
        <Text style={styles.detail}>
          <Text style={styles.label}>Từ: </Text>
          {ride.start_location}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Đến: </Text>
          {ride.end_location}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Ngày xuất phát: </Text>
          {new Date(ride.date).toLocaleDateString('vi-VN')}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Thời gian khởi hành: </Text>
          {ride.time_start}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Giá: </Text>
          {ride.price.toLocaleString('vi-VN')} VND
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Trạng thái: </Text>
          {ride.status}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Số lượng khách: </Text>
          {ride.customerCount}
        </Text>
      </View>

      {ride.driver && (
        <View style={styles.card}>
          <Text style={styles.detail}>
            <Text style={styles.label}>Tài xế: </Text>
            {ride.driver.firstName} {ride.driver.lastName}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.label}>Số điện thoại: </Text>
            {ride.driver.phoneNumber}
          </Text>
        </View>
      )}
      {ride.status != "completed" && (
        <TouchableOpacity style={styles.routeButton} onPress={handleRoute}>
          <Text style={styles.routeButtonText}>Kiểm tra vị trí</Text>
        </TouchableOpacity>
      )
      }
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#222',
  },
  routeButton: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  routeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RideDetailScreen;
