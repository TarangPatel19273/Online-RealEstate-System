import axios from 'axios';

const API_URL = 'http://localhost:8080/api/wishlist';

const wishlistService = {
  // Add property to wishlist
  addToWishlist: (propertyId) => {
    const token = localStorage.getItem('token');
    return axios.post(
      `${API_URL}/add/${propertyId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  },

  // Remove property from wishlist
  removeFromWishlist: (propertyId) => {
    const token = localStorage.getItem('token');
    return axios.delete(
      `${API_URL}/remove/${propertyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  },

  // Check if property is in wishlist
  checkWishlist: (propertyId) => {
    const token = localStorage.getItem('token');
    return axios.get(
      `${API_URL}/check/${propertyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  },

  // Get all wishlist items
  getMyWishlist: () => {
    const token = localStorage.getItem('token');
    return axios.get(
      `${API_URL}/my-wishlist`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
};

export default wishlistService;
