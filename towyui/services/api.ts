import axios from 'axios';

// Types
interface SignupData {
    name: string;
    email: string;
    password: string;
    role: string;
    businessName?: string;
    phoneNumber?: string;
    services?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const authService = {
    signup: async (data: SignupData) => {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
        }

        return response.json();
    },

    login: async (credentials: { email: string; password: string }) => {
        console.log('Attempting login with:', credentials);
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        console.log('Login response:', data);
        
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        
        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
    }
}; 