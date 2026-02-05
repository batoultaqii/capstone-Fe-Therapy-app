import type { User } from '@/src/store/auth-store';
import { apiClient } from './client';

const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true';

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  email?: string;
  username: string;
  password: string;
  avatarId?: string;
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      response?: { data?: { message?: string; error?: string }; status?: number };
      message?: string;
    };
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

// Backend: POST /users with optional avatarId → { success, data: { token, user } }
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  if (USE_MOCK_AUTH) {
    await new Promise((r) => setTimeout(r, 400));
    return mockAuthResponse(payload.username);
  }
  const { data } = await apiClient.post<BackendRegisterResponseNew>(
    '/users',
    {
      ...(payload.email && { email: payload.email }),
      username: payload.username,
      password: payload.password,
      ...(payload.avatarId !== undefined &&
        payload.avatarId !== '' && { avatarId: payload.avatarId }),
    }
  );
  return mapBackendRegisterToAuth(data);
}

interface BackendRegisterResponseNew {
  success: true;
  data: { token: string; user: { _id: string | { toString(): string }; username: string } };
}

function mapBackendRegisterToAuth(res: BackendRegisterResponseNew): RegisterResponse {
  const u = res.data.user;
  const id = typeof u._id === 'string' ? u._id : u._id.toString();
  return { token: res.data.token, user: { id, username: u.username } };
}

export interface LoginPayload {
  username: string;
  password: string;
}

// Backend: POST /auth/login → { success, data: { token, user } }
interface BackendLoginResponse {
  success: boolean;
  data: { token: string; user: { _id: string | { toString(): string }; username: string; avatarId?: string } };
}

export async function login(payload: LoginPayload): Promise<RegisterResponse> {
  if (USE_MOCK_AUTH) {
    await new Promise((r) => setTimeout(r, 400));
    return mockAuthResponse(payload.username);
  }
  const { data } = await apiClient.post<BackendLoginResponse>('/auth/login', payload);
  const u = data.data.user;
  const id = typeof u._id === 'string' ? u._id : u._id.toString();
  return {
    token: data.data.token,
    user: {
      id,
      username: u.username,
      ...(typeof u.avatarId === 'string' && { avatarId: u.avatarId }),
    },
  };
}
// نوع الاستجابة من الباكند
export interface ProfileData {
  _id: string;
  username: string;
  avatarId: string;
}

export async function getProfile(): Promise<ProfileData | null> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: ProfileData }>("/users/me");
    if (data?.success && data?.data) return data.data;
    return null;
  } catch {
    return null;
  }
}