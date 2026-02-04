import type { User } from '@/src/store/auth-store';
import { apiClient } from './client';

// Use mock auth when no API URL is set (avoids Network Error) or when EXPO_PUBLIC_USE_MOCK_AUTH=true.
// Set EXPO_PUBLIC_API_URL to your backend URL to use the real API.
const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true';

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  email?: string;
  username: string;
  password: string;
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as { response?: { data?: { message?: string; error?: string }; status?: number }; message?: string };
    const msg = err.response?.data?.message ?? err.response?.data?.error;
    if (msg) return typeof msg === 'string' ? msg : JSON.stringify(msg);
    if (err.response?.status) return `Request failed (${err.response.status})`;
    if (err.message) return err.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

function mockAuthResponse(username: string): RegisterResponse {
  return {
    token: `mock-token-${Date.now()}`,
    user: { id: `mock-${username}`, username },
  };
}

// Backend (capstone-be): POST /api/users, body { username, password }
// Response: { message, newUser }. Backend does not return JWT on register, so we login to get a token.
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  if (USE_MOCK_AUTH) {
    await new Promise((r) => setTimeout(r, 400));
    return mockAuthResponse(payload.username);
  }
  await apiClient.post<BackendRegisterResponse>('/api/users', {
    ...(payload.email && { email: payload.email }),
    username: payload.username,
    password: payload.password,
  });
  // Log in to get JWT for subsequent requests
  return login({ username: payload.username, password: payload.password });
}

interface BackendRegisterResponse {
  message: string;
  newUser: { _id: string | { toString(): string }; username: string };
}

export interface LoginPayload {
  username: string;
  password: string;
}

// Backend (capstone-be): POST /api/auth/login → { success, data: { token, user: { _id, username } } }
interface BackendLoginResponse {
  success: boolean;
  data: { token: string; user: { _id: string | { toString(): string }; username: string } };
}

export async function login(payload: LoginPayload): Promise<RegisterResponse> {
  if (USE_MOCK_AUTH) {
    await new Promise((r) => setTimeout(r, 400));
    return mockAuthResponse(payload.username);
  }
  const { data } = await apiClient.post<BackendLoginResponse>('/api/auth/login', payload);
  const id = typeof data.data.user._id === 'string' ? data.data.user._id : data.data.user._id.toString();
  return {
    token: data.data.token,
    user: { id, username: data.data.user.username },
  };
}
