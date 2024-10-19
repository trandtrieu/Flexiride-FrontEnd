// screens/ManageBookingScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { getCustomerRides } from '../../service/BookingCarpoolApi';

export const ManageBookingScreen = () => {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    getCustomerRides().then(response => {
      setRides(response.data);
    }).catch(err => console.log(err));
  }, []);

  return (
    <View>
      <FlatList
        data={rides}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ padding: 20 }}>
            <Text>{item.start_location} - {item.end_location}</Text>
            <Text>{item.time_start}</Text>
            <Text>{item.price} VNĐ</Text>
          </View>
        )}
      />
    </View>
  );
};
