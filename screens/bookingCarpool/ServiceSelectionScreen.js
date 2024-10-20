// screens/ServiceSelectionScreen.js
import React from 'react';
import { View, Button, Text } from 'react-native';

export const ServiceSelectionScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Chọn dịch vụ:</Text>
      <Button
        title="Đặt xe ghép"
        onPress={() => navigation.navigate('CarpoolRequest')}
      />
      
      <Button
        title="Quản lý chuyến xe"
        onPress={() => navigation.navigate('ManageBooking')}
      />
    </View>
  );
};
