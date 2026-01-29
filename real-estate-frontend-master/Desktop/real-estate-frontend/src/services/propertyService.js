import axios from "axios";

const API_URL = "http://localhost:8080/api/properties";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Get all properties
export const getAllProperties = () => {
  return axios.get(`${API_URL}`);
};

// Get user's properties
export const getMyProperties = () => {
  return axios.get(`${API_URL}/my-properties`, {
    headers: getAuthHeader(),
  });
};

// Get property by ID
export const getPropertyById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

// Upload property
export const uploadProperty = (formData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_URL}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

// Update property
export const updateProperty = (id, propertyData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return Promise.reject(new Error("No authentication token found"));
  }
  return axios.put(`${API_URL}/${id}`, propertyData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Delete property
export const deleteProperty = (id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${API_URL}/user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

const propertyService = {
  getAllProperties,
  getMyProperties,
  getPropertyById,
  uploadProperty,
  updateProperty,
  deleteProperty,
};

export default propertyService;
