import { apiClient, USE_MOCK } from './client';
import { mockDb } from '../mocks/store';
import type { Incident } from '../types/api';

export async function listIncidents(monitorId?: string): Promise<Incident[]> {
  if (USE_MOCK) {
    const db = await mockDb.getAll();
    const all = monitorId ? db.incidents.filter((i) => i.monitorId === monitorId) : db.incidents;
    return [...all].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }
  const { data } = await apiClient.get('/incidents/', { params: monitorId ? { monitor: monitorId } : {} });
  return data.results ?? data;
}
