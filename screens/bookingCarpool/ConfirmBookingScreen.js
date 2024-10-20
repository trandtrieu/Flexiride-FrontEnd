// screens/ConfirmBookingScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';

export const ConfirmBookingScreen = ({ route, navigation }) => {
  const { ride } = route.params;

  return (
    <View>
      <Text>Điểm đón: {ride.start_location}</Text>
      <Text>Điểm đến: {ride.end_location}</Text>
      <Text>Thời gian khởi hành: {ride.time_start}</Text>
      <Text>Giá tiền: {ride.price} VNĐ</Text>
      <Button title="Xác nhận tham gia" onPress={() => navigation.navigate('ManageBooking')} />
    </View>
  );
};
