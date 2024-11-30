import axios from "axios";
import { IP_ADDRESS } from "@env";

const CUSTOMER_API_URL = `https://flexiride.onrender.com/customer/`;

const getAllCustomers = async () => {
  try {
    const response = await axios.get(`${CUSTOMER_API_URL}customers`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to fetch customer");
    }
  } catch (error) {
    console.error("Error fetching customer:", error.message);
    throw error;
  }
};

const getCustomerById = async (customerId) => {
  try {
    const response = await axios.get(`${CUSTOMER_API_URL}detail/${customerId}`);
    if (response.status === 200) {
      return response.data; // Return the driver data
    } else {
      throw new Error("Failed to fetch customer");
    }
  } catch (error) {
    console.error("Error fetching customer by ID:", error.message);
    throw error; // Rethrow the error to be handled elsewhere
  }
};

const updateCustomer = async (customerId, updateData, token) => {
  try {
    const response = await axios.put(
      `${CUSTOMER_API_URL}update-cus/${customerId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Attach Bearer Token
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response.data; // Return the updated driver data
    } else {
      throw new Error("Failed to update customer");
    }
  } catch (error) {
    console.error("Error updating customer:", error.message);
    throw error;
  }
};

export { getAllCustomers, getCustomerById, updateCustomer };
