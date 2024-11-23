import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const services = [
  { id: '6713ed463526cf13c53cb3be', name: 'Xe ghép 4 chỗ' },
  { id: '6720efb1e61ab7d2e924219b', name: 'Xe ghép 7 chỗ' },
  { id: '6720efc9e61ab7d2e924219c', name: 'Xe ghép limousine' },
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
    backgroundColor: '#f4f6fc',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
  },
  serviceButton: {
    backgroundColor: '#3498db',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  serviceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TypeService;
