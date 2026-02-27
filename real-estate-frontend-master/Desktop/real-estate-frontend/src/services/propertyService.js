import axiosInstance from "./axiosConfig";

// Get all properties
export const getAllProperties = () => {
  return axiosInstance.get('/api/properties');
};

// Get user's properties
export const getMyProperties = () => {
  return axiosInstance.get('/api/properties/my-properties');
};

// Get property by ID
export const getPropertyById = (id) => {
  return axiosInstance.get(`/api/properties/${id}`);
};

// Upload property
export const uploadProperty = (formData) => {
  return axiosInstance.post('/api/properties/upload', formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Update property
export const updateProperty = (id, formData) => {
  return axiosInstance.put(`/api/properties/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete property
export const deleteProperty = (id) => {
  return axiosInstance.delete(`/api/properties/user/${id}`);
};

const propertyService = {
  getAllProperties,
  getMyProperties,
  getPropertyById,
  uploadProperty,
  updateProperty,
  deleteProperty,
  searchProperties: (queryParams) => {
    return axiosInstance.get('/api/properties/search', { params: queryParams });
  },
  compareProperties: (ids) => {
    return axiosInstance.get('/api/properties/compare', { params: { ids: ids.join(",") } });
  }
};

export default propertyService;
