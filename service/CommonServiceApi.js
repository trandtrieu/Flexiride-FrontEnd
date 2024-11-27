import axios from 'axios';

const domain = 'http://192.168.111.52:3000/notification'; // Add /notification to the base URL

// Tokens for customer 
const CUSTOMER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3M2RkNGRkZjJmNWQyM2M1Yzg3YzY0NSIsImVtYWlsIjoidHRoaW5oMjQwMjIwMDJAZ21haWwuY29tIiwiaWF0IjoxNzMyNzI1ODI3LCJleHAiOjE3MzI3Mjk0Mjd9.vHcCWoz-zdvIJtLUxXhXemuvD0RFO7xqaTPFb7j4VRg';

// Configure axios instances with tokens for customer 
const customerApi = axios.create({
  baseURL: domain,
  headers: {
    Authorization: `Bearer ${CUSTOMER_TOKEN}`,
  },
});

// API for customers
export const getPersonalNotification = () => customerApi.get('/your-notification');
export const markAsRead = (requestId) => customerApi.post(`/mark-as-read/${requestId}`);

