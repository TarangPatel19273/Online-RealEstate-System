import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

// Signup → Send OTP
export const signup = (data) => {
  return axios.post(`${API_URL}/signup`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
// Login → Send OTP
export const sendOtp = (email) => {
  return axios.post(`${API_URL}/login`, { email });
};

// Verify OTP → Get JWT
export const verifyOtp = (email, otp) => {
  return axios.post(`${API_URL}/verify-otp`, { email, otp });
};
