import type { SupportSession } from '@/src/store/sessions-store';
import { apiClient } from './client';

const SESSIONS_BASE = '/sessions';

interface BackendSessionsResponse {
  success: boolean;
  data: SupportSession[];
}

export async function getSessions(): Promise<SupportSession[]> {
  const { data } = await apiClient.get<BackendSessionsResponse>(SESSIONS_BASE);
  if (!data.success || !Array.isArray(data.data)) return [];
  return data.data.map((s) => ({
    ...s,
    description: s.description ?? '',
  }));
}

export async function getSessionById(id: string): Promise<SupportSession | null> {
  const { data } = await apiClient.get<{ success: boolean; data: SupportSession }>(
    `${SESSIONS_BASE}/${id}`
  );
  if (!data.success || !data.data) return null;
  return { ...data.data, description: data.data.description ?? '' };
}
