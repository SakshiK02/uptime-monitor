import { apiClient, USE_MOCK } from './client';
import { tokenStore } from './tokenStore';
import { mockDb } from '../mocks/store';
import type { User } from '../types/api';

export interface Credentials {
  username: string;
  password: string;
}

export async function login(credentials: Credentials): Promise<User> {
  if (USE_MOCK) {
    const db = await mockDb.getAll();
    tokenStore.setAccess('mock-access-token');
    tokenStore.setRefresh('mock-refresh-token');
    return db.user;
  }
  const { data } = await apiClient.post('/auth/token/', credentials);
  tokenStore.setAccess(data.access);
  tokenStore.setRefresh(data.refresh);
  const me = await apiClient.get('/auth/me/');
  return me.data as User;
}

export async function register(payload: Credentials & { email: string }): Promise<User> {
  if (USE_MOCK) {
    return login({ username: payload.username, password: payload.password });
  }
  await apiClient.post('/auth/register/', payload);
  return login({ username: payload.username, password: payload.password });
}

export async function fetchMe(): Promise<User | null> {
  if (!tokenStore.getAccess() && !tokenStore.getRefresh()) return null;
  if (USE_MOCK) {
    const db = await mockDb.getAll();
    tokenStore.setAccess('mock-access-token');
    return db.user;
  }
  const { data } = await apiClient.get('/auth/me/');
  return data as User;
}

export function logout(): void {
  tokenStore.clear();
}
