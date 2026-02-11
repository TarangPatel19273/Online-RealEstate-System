import axiosInstance from "./axiosConfig";

// Get all properties
export const getAllProperties = () => {
  return axiosInstance.get('/properties');
};

// Get user's properties
export const getMyProperties = () => {
  return axiosInstance.get('/properties/my-properties');
};

// Get property by ID
export const getPropertyById = (id) => {
  return axiosInstance.get(`/properties/${id}`);
};

// Upload property
export const uploadProperty = (formData) => {
  return axiosInstance.post('/properties/upload', formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Update property
export const updateProperty = (id, formData) => {
  return axiosInstance.put(`/properties/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete property
export const deleteProperty = (id) => {
  return axiosInstance.delete(`/properties/user/${id}`);
};

const propertyService = {
  getAllProperties,
  getMyProperties,
  getPropertyById,
  uploadProperty,
  updateProperty,
  deleteProperty,
  searchProperties: (queryParams) => {
    return axiosInstance.get('/properties/search', { params: queryParams });
  },
};

export default propertyService;
