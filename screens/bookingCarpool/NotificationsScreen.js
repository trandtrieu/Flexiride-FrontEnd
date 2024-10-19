// screens/NotificationsScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { getCustomerNotifications } from '../../service/BookingCarpoolApi';

export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getCustomerNotifications().then(response => {
      setNotifications(response.data.notifications);
    }).catch(err => console.log(err));
  }, []);

  return (
    <View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ padding: 20 }}>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};
