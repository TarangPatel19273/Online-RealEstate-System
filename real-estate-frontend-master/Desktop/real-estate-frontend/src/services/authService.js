import axiosInstance from "./axiosConfig";

// Signup → Send OTP
export const signup = (data) => {
  return axiosInstance.post(`/api/auth/signup`, data);
};
// Login
export const login = (data) => {
  return axiosInstance.post(`/api/auth/login`, data);
};

// Google Login
export const googleLogin = (credential) => {
  return axiosInstance.post(`/api/auth/google`, { token: credential });
};

// Verify OTP → Get JWT
export const verifyOtp = (email, otp, isAdmin = false) => {
  return axiosInstance.post(`/api/auth/verify-otp`, { email, otp, adminRecord: isAdmin });
};

// Forgot Password → Send OTP to email
export const forgotPassword = (email) => {
  return axiosInstance.post(`/api/auth/forgot-password`, { email });
};

// Verify OTP for Password Reset
export const verifyPasswordResetOtp = (email, otp) => {
  return axiosInstance.post(`/api/auth/verify-password-reset-otp`, { email, otp });
};

// Reset Password → Set new password
export const resetPassword = (email, otp, newPassword) => {
  return axiosInstance.post(`/api/auth/reset-password`, { email, otp, newPassword });
};
