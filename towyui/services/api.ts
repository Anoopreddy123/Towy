import axios from 'axios';

// Types
interface SignupData {
    name: string;
    email: string;
    password: string;
    role: string;
    businessName?: string;
    phoneNumber?: string;
    services?: string[];
}

// API URL configuration
export const API_URL = process.env.NODE_ENV === 'production' 
    ? "https://towy-backend.vercel.app"
    : "http://localhost:4000";

if (!API_URL) {
    throw new Error('API_URL not configured');
}

// Create Axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Error handling helper
const handleApiError = (error: any) => {
    console.error('API Error:', error);
    
    if (error.response?.data) {
        const responseData = error.response.data;
        
        if (responseData.error && responseData.error.code === '42P01') {
            throw new Error('Database setup incomplete. Please contact support.');
        }
        
        const errorMessage = typeof responseData.error === 'object' 
            ? responseData.error.message || 'Server error occurred'
            : responseData.error || responseData.message || `Request failed with status: ${error.response.status}`;
            
        throw new Error(errorMessage);
    }
    
    throw new Error(error.message || 'Network error occurred');
};

export const authService = {
    signup: async (data: SignupData) => {
        try {
            const response = await api.post('/auth/signup', data);
            return response.data;
        } catch (error: any) {
            throw handleApiError(error);
        }
    },

    login: async (credentials: { email: string; password: string; role?: string }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const data = response.data;
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('userRole', data.user.role);
            }
            return data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
    },

    loginProvider: async (credentials: { email: string; password: string }) => {
        try {
            const response = await api.post('/auth/provider/login', credentials);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    
    // Legacy methods from src/services/api.ts mapped to new structure if needed
    // keeping original signatures for compatibility
    register: (data: unknown) => api.post('/users/register', data),
    getProfile: () => api.get('/users/profile')
};

export const serviceRequests = {
    create: (data: unknown) => api.post('/services/request', data),
    getNearbyMechanics: (lat: number, lng: number) => 
        api.get(`/services/mechanics/nearby?latitude=${lat}&longitude=${lng}`),
    updateStatus: (id: string, status: string) => 
        api.patch(`/services/request/${id}/status`, { status })
};

export default api; 