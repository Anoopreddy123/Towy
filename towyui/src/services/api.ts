import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api'
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    register: (data: unknown) => api.post('/users/register', data),
    login: (data: unknown) => api.post('/users/login', data),
    getProfile: () => api.get('/users/profile')
};

export const serviceRequests = {
    create: (data: unknown) => api.post('/services/request', data),
    getNearbyMechanics: (lat: number, lng: number) => 
        api.get(`/services/mechanics/nearby?latitude=${lat}&longitude=${lng}`),
    updateStatus: (id: string, status: string) => 
        api.patch(`/services/request/${id}/status`, { status })
};