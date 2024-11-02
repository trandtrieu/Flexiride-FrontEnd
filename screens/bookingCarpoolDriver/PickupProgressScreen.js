// screens/PickupProgressScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { updatePickupProgress, getCustomerStatusPickup, updateStartStatusRequest, updateCompleteStatusRequest } from '../../service/BookingCarpoolApi';

export const PickupProgressScreen = ({ route }) => {
  const { rideInfor } = route.params;
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState([]);
  const [rideStatus, setRideStatus] = useState(rideInfor.status); // Thêm state để lưu trạng thái chuyến xe

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await getCustomerStatusPickup(rideInfor._id);
      console.log(response.data.list_customer);
      setRides(response.data.list_customer);
    } catch (error) {
      console.error('Error fetching driver rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickupCustomer = (customerId) => {
    updatePickupProgress(rideInfor._id, customerId)
      .then(() => {
        alert('Đã cập nhật trạng thái đón khách!');
        setRides((prevRides) =>
          prevRides.map((customer) =>
            customer.account_id._id === customerId ? { ...customer, pickedUp: true } : customer
          )
        );
      })
      .catch((err) => console.log(err));
  };

  const handleStartTrip = () => {
    updateStartStatusRequest(rideInfor._id)
      .then(() => {
        setRideStatus('ongoing'); 
        handleNavigate(rideInfor.end_location);
      })
      .catch((err) => {
        console.log(err);
        alert('Có lỗi xảy ra khi bắt đầu chuyến xe. Vui lòng thử lại!');
      });
  };

  const handleCompleteTrip = () => {
    updateCompleteStatusRequest(rideInfor._id)
      .then(() => {
        setRideStatus('completed'); 
        fetchRides(); 
      })
      .catch((err) => {
        console.log(err);
        alert('Có lỗi xảy ra khi kết thúc chuyến xe. Vui lòng thử lại!');
      });
  };

  const handleNavigate = (location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    Linking.openURL(url).catch((err) => console.error('Failed to open map:', err));
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
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Display ride details */}
      <View style={styles.rideDetails}>
        <Text style={styles.customerInfo}>
          ID: <Text style={styles.highlightText}>{rideInfor._id}</Text>
        </Text>
        <Text style={styles.detailText}>Đi từ: <Text style={styles.highlightText}>{rideInfor.start_location}</Text></Text>
        <Text style={styles.detailText}>Đến: <Text style={styles.highlightText}>{rideInfor.end_location}</Text></Text>
        <Text style={styles.detailText}>Ngày: <Text style={styles.highlightText}>{formatDate(rideInfor.date)}</Text></Text>
        <Text style={styles.detailText}>Thời gian: <Text style={styles.highlightText}>{formatTime(rideInfor.time_start)}</Text></Text>
        <Text style={styles.detailText}>Giá: <Text style={styles.priceText}>{formatPrice(rideInfor.price)} VNĐ</Text></Text>
        <Text style={styles.detailText}>Trạng thái: <Text style={{ color: '#4CAF50' }}>{rideStatus}</Text></Text>
        
        {rideStatus === 'accepted' && (
          <TouchableOpacity style={styles.navigateButton} onPress={handleStartTrip}>
            <Text style={styles.buttonText}>Lẹt gô</Text>
          </TouchableOpacity>
        )}
        
        {rideStatus === 'ongoing' && (
          <TouchableOpacity style={styles.navigateButton} onPress={handleCompleteTrip}>
            <Text style={styles.buttonText}>Kết thúc chuyến</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List of pickup locations */}
      <FlatList
        data={rides || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.customerInfo}>
              Khách: <Text style={styles.highlightText}>{item.account_id.name}</Text>
            </Text>
            <Text style={styles.customerInfo}>
              Số điện thoại: <Text style={styles.highlightText}>{item.account_id.phone}</Text>
            </Text>
            <Text style={styles.customerInfo}>
              Địa chỉ: <Text style={styles.highlightText}>{item.location}</Text>
            </Text>
            <Text style={styles.statusText}>
              Trạng thái:
              <Text style={{ color: item.pickedUp ? '#4CAF50' : '#F44336' }}>
                {item.pickedUp ? ' Đã đón' : ' Chưa đón'}
              </Text>
            </Text>
            {rideStatus !== 'completed' && !item.pickedUp && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.pickupButton} onPress={() => handlePickupCustomer(item.account_id._id)}>
                  <Text style={styles.buttonText}>Đã đón</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navigateButton} onPress={() => handleNavigate(item.location)}>
                  <Text style={styles.buttonText}>Chỉ đường</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f8ff',
  },
  rideDetails: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  highlightText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  priceText: {
    color: '#4CAF50',
    fontWeight: 'bold',
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
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  customerInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickupButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  navigateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
