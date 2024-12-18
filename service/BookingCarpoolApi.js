import axios from "axios";
import { IP_ADDRESS } from "@env"; // Assuming IP_ADDRESS is managed via environment variables

// Configure the base domain
const DOMAIN = `https://flexiride.onrender.com/booking-carpool`; // Use the IP from the environment variable

// Function to create Axios instances with token passed as argument
const createApiInstance = (token) => {
  return axios.create({
    baseURL: DOMAIN,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Customer API calls
export const createCarpoolRequest = async (data, customerToken) => {
  console.log("work api ");
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.post("/create-request", data);
    return response;
  } catch (error) {
    // console.error('Error creating carpool request:', error.message);
    throw error;
  }
};

export const getAvailableRides = async (params, customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    console.log("check", customerToken);
    console.log("params", params);
    const response = await customerApi.get("/available-rides", { params });
    console.log("Pass call check", customerToken);

    return response;
  } catch (error) {
    // console.error('Error fetching available rides:', error.message);
    throw error;
  }
};

export const joinCarpoolRequest = async (
  requestId,
  location,
  customerToken
) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.post(
      `/join-request/${requestId}`,
      location
    );
    return response;
  } catch (error) {
    // console.error('Error joining carpool request:', error.message);
    throw error;
  }
};

export const cancelCarpoolRequest = async (requestId, customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.post(`/unjoin-request/${requestId}`);
    return response;
  } catch (error) {
    // console.error('Error canceling carpool request:', error.message);
    throw error;
  }
};

export const getCustomerRides = async (customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.get("/my-rides");
    return response;
  } catch (error) {
    // console.error('Error fetching customer rides:', error.message);
    throw error;
  }
};

export const getCustomerNotifications = async (customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.get("/notification/");
    return response;
  } catch (error) {
    // console.error('Error fetching customer notifications:', error.message);
    throw error;
  }
};

export const submitFeedback = async (driverId, feedbackData, customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.post(
      `/feedback/${driverId}`,
      feedbackData
    );
    return response;
  } catch (error) {
    // console.error('Error submitting feedback:', error.message);
    throw error;
  }
};

export const getDriverLocation = async (driverId, customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.get(`/driver-location/${driverId}`);
    return response;
  } catch (error) {
    // console.error('Error fetching driver location:', error.message);
    throw error;
  }
};

export const getCustomerLocation = async (requestId, customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.get(`/get-location/${requestId}`);
    return response;
  } catch (error) {
    // console.error('Error fetching customer location:', error.message);
    throw error;
  }
};

export const getPersonalNotification = async (customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.get(`/your-notification`);
    return response;
  } catch (error) {
    // console.error('Error fetching personal notifications:', error.message);
    throw error;
  }
};

// Driver API calls
export const getDriverAvailableRides = async (driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.get("/driver-rides/get-request");
    return response;
  } catch (error) {
    // console.error('Error fetching available rides for driver:', error.message);
    throw error;
  }
};

export const acceptCarpoolRequest = async (requestId, driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.post(`/accept-request/${requestId}`);
    return response;
  } catch (error) {
    // console.error('Error accepting carpool request:', error.message);
    throw error;
  }
};

export const getDriverRides = async (driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.get("/driver-rides");
    return response;
  } catch (error) {
    // console.error('Error fetching driver rides:', error.message);
    throw error;
  }
};

export const updatePickupProgress = async (rideId, customerId, driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.put(
      `/driver-rides/${rideId}/pickup/${customerId}`
    );
    return response;
  } catch (error) {
    // console.error('Error updating pickup progress:', error.message);
    throw error;
  }
};

export const getCustomerStatusPickup = async (rideId, driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.get(`/driver-rides/${rideId}`);
    return response;
  } catch (error) {
    // console.error('Error fetching customer status:', error.message);
    throw error;
  }
};

export const updateStartStatusRequest = async (rideId, driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.put(`/driver-rides/${rideId}/start`);
    return response;
  } catch (error) {
    // console.error('Error updating start status:', error.message);
    throw error;
  }
};

export const updateCompleteStatusRequest = async (rideId, driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.put(`/driver-rides/${rideId}/complete`);
    return response;
  } catch (error) {
    // console.error('Error updating complete status:', error.message);
    throw error;
  }
};
