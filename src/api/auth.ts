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
  username: string;
  password: string;
  avatarUri?: string | null;
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
// Response: { message, newUser } with newUser: { _id, username, ... }
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  if (USE_MOCK_AUTH) {
    await new Promise((r) => setTimeout(r, 400));
    return mockAuthResponse(payload.username);
  }
  const { data } = await apiClient.post<BackendRegisterResponse>('/api/users', {
    username: payload.username,
    password: payload.password,
  });
  return mapBackendUserToAuth(data);
}

interface BackendRegisterResponse {
  message: string;
  newUser: { _id: string | { toString(): string }; username: string };
}

function mapBackendUserToAuth(res: BackendRegisterResponse): RegisterResponse {
  const id = typeof res.newUser._id === 'string' ? res.newUser._id : res.newUser._id.toString();
  return {
    token: id,
    user: { id, username: res.newUser.username },
  };
}

export interface LoginPayload {
  username: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<RegisterResponse> {
  if (USE_MOCK_AUTH) {
    await new Promise((r) => setTimeout(r, 400));
    return mockAuthResponse(payload.username);
  }
  const { data } = await apiClient.post<RegisterResponse>('/login', payload);
  return data;
}
