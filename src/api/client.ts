import axios, { type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/src/store/auth-store';

/**
 * Backend API base URL (capstone-be).
 * Set EXPO_PUBLIC_API_URL in .env or app config.
 * Examples:
 *   - iOS Simulator: http://localhost:8000
 *   - Android Emulator: http://10.0.2.2:8000
 *   - Physical device (same network): http://YOUR_COMPUTER_IP:8000
 */
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every request when user is logged in
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: handle 401 (e.g. clear auth so user can log in again)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      // You can trigger navigation to login here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;
