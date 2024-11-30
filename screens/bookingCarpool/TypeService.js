import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const services = [
  { id: '67414fb314fada16bde3ada7', name: 'Xe ghép 4 chỗ' },
  { id: '67414fbd14fada16bde3adaa', name: 'Xe ghép 7 chỗ' },
  { id: '67414fe614fada16bde3adad', name: 'Xe ghép limousine' },
];

export const TypeService = ({ navigation }) => {
  const handleSelectService = (serviceId) => {
    navigation.navigate('CarpoolRequest', { serviceId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn loại dịch vụ</Text>
      <Text style={styles.subtitle}>
        Vui lòng chọn một loại dịch vụ phù hợp với nhu cầu của bạn:
      </Text>
      {services.map((service) => (
        <TouchableOpacity
          key={service.id}
          style={styles.serviceButton}
          onPress={() => handleSelectService(service.id)}
        >
          <Text style={styles.serviceText}>{service.name}</Text>
        </TouchableOpacity>
      ))}
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
    textAlign: 'center',
  },
  serviceButton: {
    backgroundColor: '#FBC02D',  // Light yellow button color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  serviceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TypeService;
