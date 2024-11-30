import axios from "axios";
import { IP_ADDRESS } from "@env";

const CUSTOMER_API_URL = `http://${IP_ADDRESS}:3000/customer/`;
const AUTH_API_URL = `http://${IP_ADDRESS}:3000/auth/`;

const registerCustomer = async (customerData) => {
  try {
    const response = await axios.post(
      `${AUTH_API_URL}register-customer`,
      customerData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during customer registration:", error);
    throw error;
  }
};

// Function to update the password for a given email
const updatePassword = async (email, newPassword) => {
  try {
    const response = await axios.put(
      `${AUTH_API_URL}forgot-password-cus`,
      { email, newPassword },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

const changeCustomerPassword = async (customerId, newPassword, token) => {
  try {
    const response = await axios.put(
      `${CUSTOMER_API_URL}change-password-cus/${customerId}`,
      { newPassword },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the Bearer token here
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error changing password:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export { registerCustomer, updatePassword, changeCustomerPassword };
