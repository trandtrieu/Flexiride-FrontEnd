import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { availableRides, getAvailableRides } from '../../service/BookingCarpoolApi'; // Thay đổi API
import { useAuth } from "../../provider/AuthProvider";

export const ViewAllAvailableRideScreen = ({ route, navigation }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
  
        const { start_location, end_location, date, time_start, service_id } = route.params || {};
  
        // Set default values if parameters are missing
        const queryParams = {
          start_location: start_location || '',
          end_location: end_location || '',
          date: date || '',
          time_start: time_start || '',
          service_id: service_id || ''
        };
  
        // Call API to get the list of rides
        const response = await getAvailableRides(queryParams, authState.token);
  
        console.log('API Response:', response.data);
        setRides(response.data);
      } catch (error) {
        console.error('Error fetching rides:', error.response?.data || error);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchRides();
  }, [route.params]);

  const handleJoinPress = (requestId) => {
    navigation.navigate('JoinRequestScreen', { requestId }); 
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getServiceName = (serviceId) => {
    switch (serviceId) {
      case '67414fb314fada16bde3ada7':
        return 'Xe ghép 4 chỗ';
      case '67414fbd14fada16bde3adaa':
        return 'Xe ghép 7 chỗ';
      case '67414fe614fada16bde3adad':
        return 'Xe ghép limousine';
      default:
        return 'Dịch vụ không xác định';
    }
  };

  const getMaxSeats = (serviceId) => {
    switch (serviceId) {
      case '67414fb314fada16bde3ada7':
        return 4;
      case '67414fbd14fada16bde3adaa':
        return 7;
      case '67414fe614fada16bde3adad':
        return 7;
      default:
        return 4; // Giá trị mặc định nếu không xác định được loại xe
    }
  };

  // Hàm kiểm tra xem chuyến xe có còn ghế trống không
  const hasAvailableSeats = (item) => {
    const maxSeats = getMaxSeats(item.service_option_id._id); // Số ghế tối đa
    const numberOfPassengers = item.pickup_location?.length || 0;
    return numberOfPassengers < maxSeats; // Chỉ hiển thị nếu còn ghế trống
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chuyến xe tương tự</Text>
      <FlatList
        data={rides.filter(hasAvailableSeats)} // Lọc các chuyến xe còn ghế trống
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const maxSeats = getMaxSeats(item.service_option_id._id); // Số ghế tối đa
          const numberOfPassengers = item.pickup_location?.length || 0;
          const seatRatio = `${numberOfPassengers}/${maxSeats}`;

          return (
            <View style={styles.card}>
              <Text style={styles.location}>{`Từ: ${item.start_location}`}</Text>
              <Text style={styles.location}>{`Đến: ${item.end_location}`}</Text>
              <Text style={styles.time}>{`Giờ khởi hành: ${item.time_start}`}</Text>
              <Text style={styles.time}>{`Số lượng khách: ${seatRatio}`}</Text>
              <Text style={styles.time}>{`Dịch vụ: ${getServiceName(item.service_option_id._id)}`}</Text>
              <Text style={styles.time}>{`Tài xế: ${item.driver_id ? 'đã nhận' : 'chưa nhận'}`}</Text>
              <Text style={styles.price}>
                {`Giá mỗi khách: ${formatCurrency(item.price / (item.pickup_location?.length || 1))}`}
              </Text>

              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => handleJoinPress(item._id)}  
              >
                <Text style={styles.joinButtonText}>Tham gia</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có chuyến xe nào phù hợp</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  time: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  joinButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});
