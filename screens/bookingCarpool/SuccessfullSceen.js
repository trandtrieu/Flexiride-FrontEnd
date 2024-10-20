// screens/SucessfullScreen.js
import React from 'react';
import { View, Button, Text } from 'react-native';

export const SucessfullScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Đã tạo thành công</Text>
      <Button
        title="Về trang chủ"
        onPress={() => navigation.navigate('ServiceSelection')}
      />
    </View>
  );
};
