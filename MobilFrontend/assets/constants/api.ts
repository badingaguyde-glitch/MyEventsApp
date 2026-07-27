import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || Platform.select({
    android: "http://10.0.2.2:5000/api",
    ios: "http://localhost:5000/api",
    default: "http://localhost:5000/api"
});

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'x-bantu-client-key': 'BantuAppClientSecretSecured2026!'
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            AsyncStorage.removeItem('token');
            AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;