import axios from 'axios';

const domain = 'https://testapibooking.azurewebsites.net/booking-carpool'; // Add /booking-carpool to the base URL

// Tokens for customer and driver
const CUSTOMER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU4ZjQxYWMyYWNiODM1ZmY5MGRmNCIsImVtYWlsIjoidGhpbmhAZXhhbXBsZS5jb20iLCJpYXQiOjE3Mjk5MjQ0NTUsImV4cCI6MTcyOTkyODA1NX0.GviKu0mVIa3y8XiRJHqyx6FDqo2MeC1z5tkEWPAtIuM';
const DRIVER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGZkNDcyMmZiOGM0MDZhMjJmZDExZSIsImVtYWlsIjoidGhpbmhAZXhhbXBsZS5jb20iLCJpYXQiOjE3Mjk5MjQ0MjcsImV4cCI6MTcyOTkyODAyN30.rxcR_1uwgFUpC1MkSjutXKVjoEocMagghDDL-x_la4k';

// Configure axios instances with tokens for customer and driver
const customerApi = axios.create({
  baseURL: domain,
  headers: {
    Authorization: `Bearer ${CUSTOMER_TOKEN}`,
  },
});

const driverApi = axios.create({
  baseURL: domain,
  headers: {
    Authorization: `Bearer ${DRIVER_TOKEN}`,
  },
});

// API for customers
export const createCarpoolRequest = (data) => customerApi.post('/create-request', data);
export const getAvailableRides = (params) => customerApi.get('/available-rides', { params });

export const joinCarpoolRequest = (requestId, location) => customerApi.post(`/join-request/${requestId}`, location);
export const cancelCarpoolRequest = (requestId) => customerApi.post(`/unjoin-request/${requestId}`);

export const getCustomerRides = () => customerApi.get('/my-rides');
export const getCustomerNotifications = () => customerApi.get('/notification/');

// API for drivers
export const getDriverAvailableRides = () => driverApi.get('/driver-rides/get-request');
export const acceptCarpoolRequest = (requestId) => driverApi.post(`/accept-request/${requestId}`);
export const getDriverRides = () => driverApi.get('/driver-rides');
export const updatePickupProgress = (rideId, customerId) => driverApi.put(`/driver-rides/${rideId}/pickup/${customerId}`);
export const getCustomerStatusPickup = (rideId) => driverApi.get(`/driver-rides/${rideId}`);
export const updateStartStatusRequest = (rideId) => driverApi.put(`/driver-rides/${rideId}/start`);
export const updateCompleteStatusRequest = (rideId) => driverApi.put(`/driver-rides/${rideId}/complete`);

