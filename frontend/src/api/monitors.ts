import { apiClient, USE_MOCK } from './client';
import { genId, mockDb } from '../mocks/store';
import type { Check, Monitor } from '../types/api';

export interface MonitorInput {
  name: string;
  url: string;
  intervalMinutes: number;
  isActive: boolean;
}

export async function listMonitors(): Promise<Monitor[]> {
  if (USE_MOCK) {
    const db = await mockDb.getAll();
    return db.monitors;
  }
  const { data } = await apiClient.get('/monitors/');
  return data.results ?? data;
}

export async function getMonitor(id: string): Promise<Monitor | undefined> {
  if (USE_MOCK) {
    const db = await mockDb.getAll();
    return db.monitors.find((m) => m.id === id);
  }
  const { data } = await apiClient.get(`/monitors/${id}/`);
  return data;
}

export async function createMonitor(input: MonitorInput): Promise<Monitor> {
  if (USE_MOCK) {
    return mockDb.mutate((db) => {
      const monitor: Monitor = { ...input, id: genId('mon'), createdAt: new Date().toISOString(), currentStatus: 'pending', lastCheckedAt: null };
      db.monitors.push(monitor);
      return monitor;
    });
  }
  const { data } = await apiClient.post('/monitors/', input);
  return data;
}

export async function updateMonitor(id: string, input: MonitorInput): Promise<Monitor> {
  if (USE_MOCK) {
    return mockDb.mutate((db) => {
      const idx = db.monitors.findIndex((m) => m.id === id);
      const updated: Monitor = { ...db.monitors[idx], ...input };
      db.monitors[idx] = updated;
      return updated;
    });
  }
  const { data } = await apiClient.put(`/monitors/${id}/`, input);
  return data;
}

export async function deleteMonitor(id: string): Promise<void> {
  if (USE_MOCK) {
    await mockDb.mutate((db) => {
      db.monitors = db.monitors.filter((m) => m.id !== id);
      db.checks = db.checks.filter((c) => c.monitorId !== id);
      db.incidents = db.incidents.filter((inc) => inc.monitorId !== id);
    });
    return;
  }
  await apiClient.delete(`/monitors/${id}/`);
}

export async function listMonitorChecks(monitorId: string, hours = 24): Promise<Check[]> {
  if (USE_MOCK) {
    const db = await mockDb.getAll();
    const cutoff = Date.now() - hours * 3600000;
    return db.checks.filter((c) => c.monitorId === monitorId && new Date(c.timestamp).getTime() >= cutoff).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
  const { data } = await apiClient.get(`/monitors/${monitorId}/checks/`, { params: { hours } });
  return data.results ?? data;
}
