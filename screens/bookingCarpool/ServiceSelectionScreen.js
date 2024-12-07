import React from 'react';
import { View, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';  // For adding icons

export const ServiceSelectionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('TypeService')}
        >
          <FontAwesome name="car" size={24} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Đặt xe ghép</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ViewAllAvailableRideScreen')}
        >
          <FontAwesome name="car" size={24} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Danh sách yêu cầu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ManageBooking')}
        >
          <FontAwesome name="list-alt" size={24} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Quản lý chuyến xe</Text>
        </TouchableOpacity>
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
    backgroundColor: '#FFF9C4',  // Light yellow background
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FBC02D',  // Light yellow accent color
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBC02D',  // Light yellow buttons
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
});
