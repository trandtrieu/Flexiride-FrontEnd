import axios from "axios";
import { IP_ADDRESS } from "@env";

const DRIVER_API_URL = `http://${IP_ADDRESS}:3000/auth/`;
const AUTH_API_URL = `http://${IP_ADDRESS}:3000/auth/`;

const registerCustomer = async (customerData) => {
  try {
    const response = await axios.post(
      `${DRIVER_API_URL}register-customer`,
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

export { registerCustomer };
