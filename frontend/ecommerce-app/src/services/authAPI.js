import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});
// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Verify email OTP
  verifyEmail: async (email, otp) => {
    try {
      const response = await api.post('/users/verify-email', { email, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Email verification failed' };
    }
  },

  // Verify mobile OTP
  verifyMobile: async (mobile, otp) => {
    try {
      const response = await api.post('/users/verify-mobile', { mobile, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Mobile verification failed' };
    }
  },

  // Resend OTP
  resendOTP: async (identifier, type) => {
    try {
      const response = await api.post('/users/resend-otp', {
        [type === 'email' ? 'email' : 'mobile']: identifier,
        type,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resend OTP' };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get profile' };
    }
  },
  
  // Google Auth
  googleLogin: async (googleToken) => {
    try {
      const response = await api.post('/users/google-auth', { token: googleToken });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Google login failed' };
    }
  },

  // --- START: ADDED NEW FUNCTIONS HERE ---
  
  // Function to request a login OTP
  sendLoginOtp: async (mobile) => {
    try {
      const response = await api.post('/users/send-login-otp', { mobile });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send OTP' };
    }
  },

  // Function to verify the login OTP and get a token
  verifyLoginOtp: async (mobile, otp) => {
    try {
      const response = await api.post('/users/verify-login-otp', { mobile, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'OTP verification failed' };
    }
  },

   // --- ADD THESE TWO NEW FUNCTIONS ---
  forgotPasswordRequest: async (data) => {
    try {
      const response = await api.post('/users/forgot-password', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send reset OTP' };
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await api.post('/users/reset-password', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reset password' };
    }
  },
  

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/profile/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  },
  
  // --- ADDRESSES ---
  getAddresses: async () => {
    try {
      const response = await api.get('/addresses');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch addresses' };
    }
  },

  addAddress: async (addressData) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add address' };
    }
  },

  updateAddress: async (addressId, addressData) => {
    try {
      const response = await api.put(`/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update address' };
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete address' };
    }
  },

  setDefaultAddress: async (addressId) => {
    try {
      const response = await api.patch(`/addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to set default address' };
    }
  },

   // --- ADD THESE NEW FUNCTIONS FOR PROFILE ---
  requestContactChange: async (data) => {
    try {
      // data will be { type: 'email', value: 'new@email.com' }
      const response = await api.post('/users/profile/request-change', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to request change' };
    }
  },

  verifyContactChange: async (data) => {
    try {
      // data will be { token: '123456' }
      const response = await api.post('/users/profile/verify-change', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Verification failed' };
    }
  },

  deleteAccount: async (passwordData) => {
  try {
    // We use a POST request to send the password in the body
    const response = await api.post('/users/profile/delete', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete account' };
  }
},

// Add this function inside the authAPI object
setPassword: async (passwordData) => {
  try {
    const response = await api.put('/users/profile/set-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to set password' };
  }
},

// Add this inside the authAPI object
updateProfilePicture: async (formData) => {
  try {
    // Axios will automatically set the correct 'multipart/form-data' header
    const response = await api.put('/users/profile/picture', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile picture' };
  }
},

// Add this inside the authAPI object
removeProfilePicture: async () => {
  try {
    const response = await api.delete('/users/profile/picture');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to remove profile picture' };
  }
},

// Add these inside your authAPI object
getWishlist: async () => {
  try {
    const response = await api.get('/wishlist');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch wishlist' };
  }
},
addToWishlist: async (productId) => {
  try {
    const response = await api.post(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add item' };
  }
},
removeFromWishlist: async (productId) => {
  try {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to remove item' };
  }
},


  initiatePasswordReset: async (data) => {
    try {
      const response = await api.post('/users/profile/initiate-reset', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send reset OTP' };
    }
  },

  executePasswordReset: async (data) => {
    try {
      const response = await api.post('/users/profile/execute-reset', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reset password' };
    }
  },
};

export default api;