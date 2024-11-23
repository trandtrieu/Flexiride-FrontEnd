import axios from 'axios';

const domain = 'http://192.168.111.52:3000/booking-carpool'; // Add /booking-carpool to the base URL

// Tokens for customer and driver
const CUSTOMER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3M2RkNGRkZjJmNWQyM2M1Yzg3YzY0NSIsImVtYWlsIjoidHRoaW5oMjQwMjIwMDJAZ21haWwuY29tIiwiaWF0IjoxNzMyMTA3MTU3LCJleHAiOjE3MzIxMTA3NTd9.G9GWz2vom4Ss3X62ovdKqYsG0W66VNgViVJcSwDCL0g';
const DRIVER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGZkNDcyMmZiOGM0MDZhMjJmZDExZSIsImVtYWlsIjoidGhpbmhAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzIxMDg0NjIsImV4cCI6MTczMjExMjA2Mn0.HdhdEQGuyxU4Q2Xuu9dHtgSrdlxjQexiS7a6IzRMOyI';

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
export const submitFeedback = (driverIid, feedbackData) =>  customerApi.post(`/feedback/${driverIid}`, feedbackData);

// API for drivers
export const getDriverAvailableRides = () => driverApi.get('/driver-rides/get-request');
export const acceptCarpoolRequest = (requestId) => driverApi.post(`/accept-request/${requestId}`);
export const getDriverRides = () => driverApi.get('/driver-rides');
export const updatePickupProgress = (rideId, customerId) => driverApi.put(`/driver-rides/${rideId}/pickup/${customerId}`);
export const getCustomerStatusPickup = (rideId) => driverApi.get(`/driver-rides/${rideId}`);
export const updateStartStatusRequest = (rideId) => driverApi.put(`/driver-rides/${rideId}/start`);
export const updateCompleteStatusRequest = (rideId) => driverApi.put(`/driver-rides/${rideId}/complete`);

