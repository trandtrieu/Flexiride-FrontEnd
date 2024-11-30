// screens/ServiceSelectionScreen.js
import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';

export const ServiceSelectionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <Button
          title="Đặt xe ghép"
          onPress={() => navigation.navigate('TypeService')}
        />
        <Button
          title="Quản lý chuyến xe"
          onPress={() => navigation.navigate('ManageBooking')}
        />
        {/* <Button
          title="Quản lý chuyến xe"
          onPress={() => navigation.navigate('ManageNotification')}
        /> */}
      </View>      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8', 
  },
  section: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
});

