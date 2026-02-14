import axiosInstance from "./axiosConfig";

export const profileService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await axiosInstance.get("/user/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put("/user/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get user profile by ID
  getUserProfileById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/user/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error.response?.data || error.message;
    }
  },
};
