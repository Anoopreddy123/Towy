import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const authService = {
  signup: async (userData: { name: string; email: string; password: string }) => {
    try {
      console.log('Making signup request to:', `${API_URL}/users/signup`)
      const response = await axios.post(`${API_URL}/users/signup`, userData);
      console.log('Signup response:', response.data)
      
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Signup API error:', error);
      throw error;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, credentials);
      console.log('Login API response:', response.data); // Debug log
      
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}; 