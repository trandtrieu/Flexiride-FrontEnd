import axios from 'axios';

const domain = 'http://localhost:3000'; // Thay thế bằng URL API thực tế

// Token cho khách hàng và tài xế
const CUSTOMER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU4ZjQxYWMyYWNiODM1ZmY5MGRmNCIsImVtYWlsIjoidGhpbmhAZXhhbXBsZS5jb20iLCJpYXQiOjE3MjkzMTkyODgsImV4cCI6MTcyOTMyMjg4OH0.1Rakl5bDE6EA04HApDZqv769MTvNhJXs8P9o1uiWXyA';
const DRIVER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGZkNDcyMmZiOGM0MDZhMjJmZDExZSIsImVtYWlsIjoidGhpbmhAZXhhbXBsZS5jb20iLCJpYXQiOjE3MjkxODE0ODEsImV4cCI6MTcyOTE4NTA4MX0.z4jztfXpzF6Lx9X2XEN5qZ4sneMXiHm838lI2Cq__lI';

// Cấu hình axios để sử dụng token tương ứng cho khách hàng
const customerApi = axios.create({
  baseURL: domain,
  headers: {
    Authorization: `Bearer ${CUSTOMER_TOKEN}`,
  },
});

// Cấu hình axios để sử dụng token tương ứng cho tài xế
const driverApi = axios.create({
  baseURL: domain,
  headers: {
    Authorization: `Bearer ${DRIVER_TOKEN}`,
  },
});

// API dành cho khách hàng
export const createCarpoolRequest = (data) => customerApi.post('/booking-carpool/create-request', data);
export const getAvailableRides = (params) => customerApi.get('/booking-carpool/available-rides', { params });

export const joinCarpoolRequest = (requestId) => customerApi.post(`/booking-carpool/join-request/${requestId}`);
export const cancelCarpoolRequest = (requestId) => customerApi.post(`/booking-carpool/join-request/${requestId}`);

export const getCustomerRides = () => customerApi.get('/booking-carpool/my-rides');
export const getCustomerNotifications = () => customerApi.get('/notification/');

// API dành cho tài xế
export const getDriverAvailableRides = () => driverApi.get('/available-rides');
export const acceptCarpoolRequest = (requestId) => driverApi.post(`/accept-request/${requestId}`);
export const getDriverRides = () => driverApi.get('/driver-rides');
export const updatePickupProgress = (rideId, customerId) => driverApi.put(`/driver-rides/${rideId}/pickup/${customerId}`);
