import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Rating } from 'react-native-ratings';
import { submitFeedback } from '../../service/BookingCarpoolApi';
import { useAuth } from "../../provider/AuthProvider";

export const FeedbackScreen = ({ route, navigation }) => {
  const { ride } = route.params; // Dữ liệu chuyến đi được truyền từ route
  const [rating, setRating] = useState(0); // Giá trị mặc định của rating là 0
  const [comment, setComment] = useState('');
  const { authState } = useAuth();

  useEffect(() => {
    console.log('Ride Details:', ride);
  }, []);

  const handleSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert('Error', 'Vui lòng chọn số sao từ 1 đến 5!');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Error', 'Vui lòng nhập nhận xét!');
      return;
    }

    try {
      const feedbackData = {
        rating,
        comment,
        rideId: ride._id, // Gửi rideId vào API
      };
      await submitFeedback(ride.driver.driverId, feedbackData,  authState.token);
      Alert.alert('Thành công', 'Phản hồi đã được gửi!');
      navigation.navigate('ManageBooking');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Không thể gửi phản hồi. Vui lòng thử lại sau.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phản hồi tài xế</Text>

      {/* Thông tin tài xế */}
      <View style={styles.driverInfoContainer}>
        <Text style={styles.driverInfo}>
          <Text style={styles.infoLabel}>Tên tài xế: </Text>
          {ride.driver.lastName} {ride.driver.firstName}
        </Text>
        <Text style={styles.driverInfo}>
          <Text style={styles.infoLabel}>Số điện thoại: </Text>
          {ride.driver.phoneNumber}
        </Text>
      </View>

      {/* Đánh giá sao */}
      <Text style={styles.ratingLabel}>Đánh giá tài xế:</Text>
      <Rating
        type="star"
        startingValue={0}
        imageSize={30}
        onFinishRating={(value) => setRating(value)}
        style={styles.rating}
      />

      {/* Nhận xét */}
      <TextInput
        style={[styles.input, styles.commentInput]}
        placeholder="Nhập nhận xét của bạn..."
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
      />

      {/* Nút gửi phản hồi */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Gửi phản hồi</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  driverInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  driverInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  rating: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    fontSize: 16,
  },
  commentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default FeedbackScreen;
