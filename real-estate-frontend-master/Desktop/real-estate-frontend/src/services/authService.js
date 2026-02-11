import axiosInstance from "./axiosConfig";

// Signup → Send OTP
export const signup = (data) => {
  return axiosInstance.post(`/auth/signup`, data);
};
// Login
export const login = (data) => {
  return axiosInstance.post(`/auth/login`, data);
};

// Verify OTP → Get JWT
export const verifyOtp = (email, otp) => {
  return axiosInstance.post(`/auth/verify-otp`, { email, otp });
};
