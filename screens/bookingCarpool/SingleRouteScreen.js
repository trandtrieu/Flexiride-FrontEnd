import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { VIETMAP_API_KEY } from '@env';

const SingleRouteScreen = ({ route }) => {
  const { driverCoordinates, customerCoordinates } = route.params;
  const [routePoints, setRoutePoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: driverCoordinates.latitude,
    longitude: driverCoordinates.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const dist = calculateDistance(
      driverCoordinates.latitude,
      driverCoordinates.longitude,
      customerCoordinates.latitude,
      customerCoordinates.longitude
    );
    setDistance(dist);
    fetchRoute();
  }, []);

  const fetchRoute = async () => {
    const tspUrl = `https://maps.vietmap.vn/api/tsp?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${driverCoordinates.latitude},${driverCoordinates.longitude}&point=${customerCoordinates.latitude},${customerCoordinates.longitude}&vehicle=car&roundtrip=false`;

    try {
      const response = await fetch(tspUrl);
      const data = await response.json();

      if (data.paths && data.paths.length > 0) {
        const decodedPoints = polyline.decode(data.paths[0].points).map(([latitude, longitude]) => ({
          latitude,
          longitude,
        }));
        setRoutePoints(decodedPoints);
      } else {
        Alert.alert('Lỗi', 'Không thể tính toán lộ trình.');
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến API.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
      >
        <Polyline coordinates={routePoints} strokeWidth={4} strokeColor="blue" />
        <Marker coordinate={driverCoordinates} title="Tài xế" pinColor="green" />
        <Marker coordinate={customerCoordinates} title="Khách hàng" pinColor="red" />
      </MapView>
      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>Khoảng cách: {distance} km</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 10,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SingleRouteScreen;
