// screens/SucessfullScreen.js
import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';

export const SucessfullScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký chuyến xe thành công!</Text>
      <Text style={styles.message}>
        Chúng tôi sẽ thông báo cho bạn khi nào có tài xế nhận. 
        Vui lòng kiểm tra email thường xuyên để cập nhật thông tin chi tiết.
      </Text>
      <Button
        title="Về trang chủ"
        onPress={() => navigation.navigate('ServiceSelection')}
        color="#4CAF50"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
});
