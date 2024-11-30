import axios from 'axios';
import { IP_ADDRESS } from "@env"; // Assuming IP_ADDRESS is managed via environment variables

// Configure the base domain
const DOMAIN = `https://flexiride.onrender.com/notification`; // Use the IP from the environment variable

// Function to create Axios instance with token passed as argument
const createApiInstance = (token) => {
  return axios.create({
    baseURL: DOMAIN,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

// API for customers
export const getPersonalNotification = async (customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.get('/your-notification');
    return response;
  } catch (error) {
    console.error('Error fetching personal notifications:', error.message);
    throw error;
  }
};

export const markAsRead = async (requestId, customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.post(`/mark-as-read/${requestId}`);
    return response;
  } catch (error) {
    console.error('Error marking as read:', error.message);
    throw error;
  }
};
