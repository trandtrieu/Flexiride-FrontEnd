import axios from "axios";
import { IP_ADDRESS } from "@env";

const CUSTOMER_API_URL = `http://${IP_ADDRESS}:3000/customer/`;

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

export { getAllCustomers };
