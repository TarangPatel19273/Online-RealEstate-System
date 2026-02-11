import axiosInstance from './axiosConfig';

const wishlistService = {
  // Add property to wishlist
  addToWishlist: (propertyId) => {
    return axiosInstance.post(`/wishlist/add/${propertyId}`);
  },

  // Remove property from wishlist
  removeFromWishlist: (propertyId) => {
    return axiosInstance.delete(`/wishlist/remove/${propertyId}`);
  },

  // Check if property is in wishlist
  checkWishlist: (propertyId) => {
    return axiosInstance.get(`/wishlist/check/${propertyId}`);
  },

  // Get all wishlist items
  getMyWishlist: () => {
    return axiosInstance.get(`/wishlist/my-wishlist`);
  }
};

export default wishlistService;
