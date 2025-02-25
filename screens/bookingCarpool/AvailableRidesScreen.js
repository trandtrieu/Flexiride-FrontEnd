import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { getAvailableRides, joinCarpoolRequest } from '../../service/BookingCarpoolApi';
import { useAuth } from "../../provider/AuthProvider";

export const AvailableRidesScreen = ({ route, navigation }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchParams } = route.params || {};
  const { authState } = useAuth();

  useEffect(() => {
    const fetchRides = async () => {
      console.log('Search Params:', searchParams);
      try {
        setLoading(true);

        // Gọi API để lấy danh sách các chuyến đi
        const response = searchParams
          ? await getAvailableRides(searchParams, authState.token)
          : await getAvailableRides(null, authState.token);

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
  }, [searchParams]);

  const handleJoinRequest = async (requestId, searchParams) => {
    try {
      const { location, longitude, latitude } = searchParams || {};
      console.log("join ne")
      // if (!location || !longitude || !latitude) {
      //   Alert.alert('Lỗi', 'Thông tin vị trí không đầy đủ để tham gia chuyến đi.');
      //   return;
      // }

      console.log('Request ID:', requestId);
      console.log('Location:', location, 'Longitude:', longitude, 'Latitude:', latitude);

      // Gọi API joinCarpoolRequest với các tham số cần thiết
      await joinCarpoolRequest(requestId, { location, longitude, latitude }, authState.token);

      Alert.alert('Thành công', 'Bạn đã tham gia vào chuyến đi thành công.');
      navigation.navigate('ManageBooking');
    } catch (error) {
      console.error('Error joining request:', error.response?.data || error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chuyến xe tương tự</Text>
      <FlatList
        data={rides}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.location}>{`Từ: ${item.start_location}`}</Text>
            <Text style={styles.location}>{`Đến: ${item.end_location}`}</Text>
            <Text style={styles.time}>{`Giờ khởi hành: ${item.time_start}`}</Text>
            <Text style={styles.time}>
              {`Số lượng khách: ${Array.isArray(item.pickup_location) ? item.pickup_location.length : 0}/4`}
            </Text>
            <Text style={styles.time}>
              {`Tài xế: ${item.driver_id ? 'đã nhận' : 'chưa nhận'}`}
            </Text>
            <Text style={styles.price}>
              {`Giá mỗi khách: ${formatCurrency(item.price / (item.pickup_location?.length || 1))}`}
            </Text>

            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => handleJoinRequest(item._id, searchParams)}
            >
              <Text style={styles.joinButtonText}>Tham gia</Text>
            </TouchableOpacity>
          </View>
        )}
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
