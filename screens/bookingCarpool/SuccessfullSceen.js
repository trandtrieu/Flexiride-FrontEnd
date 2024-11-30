// screens/SucessfullScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const SucessfullScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký chuyến xe thành công!</Text>
      <Text style={styles.message}>
        Chúng tôi sẽ thông báo cho bạn khi nào có tài xế nhận. 
        Vui lòng kiểm tra email thường xuyên để cập nhật thông tin chi tiết.
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ServiceSelection')}
      >
        <Text style={styles.buttonText}>Về trang chủ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4CAF50', // Màu xanh lá cây để biểu thị sự thành công
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#6c757d', // Màu xám nhẹ để tạo sự dễ đọc
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#4CAF50', // Nút màu xanh lá cây
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
