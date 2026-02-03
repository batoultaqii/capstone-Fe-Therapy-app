/**
 * API layer: connect frontend to backend.
 *
 * Usage:
 *   import { apiClient, register, login } from '@/src/api';
 *
 * Or per module:
 *   import { apiClient } from '@/src/api/client';
 *   import { register, login } from '@/src/api/auth';
 */

export { apiClient } from './client';
export {
  register,
  login,
  getErrorMessage,
  type RegisterPayload,
  type RegisterResponse,
  type LoginPayload,
} from './auth';
