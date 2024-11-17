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
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  serviceButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  serviceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TypeService;
