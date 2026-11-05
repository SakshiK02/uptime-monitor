import { apiClient, USE_MOCK } from './client';
import { genId, mockDb } from '../mocks/store';
import type { AlertChannel, AlertChannelType } from '../types/api';

export interface AlertChannelInput {
  type: AlertChannelType;
  target: string;
  isEnabled: boolean;
}

export async function listAlertChannels(): Promise<AlertChannel[]> {
  if (USE_MOCK) {
    const db = await mockDb.getAll();
    return db.alertChannels;
  }
  const { data } = await apiClient.get('/alert-channels/');
  return data.results ?? data;
}

export async function createAlertChannel(input: AlertChannelInput): Promise<AlertChannel> {
  if (USE_MOCK) {
    return mockDb.mutate((db) => {
      const channel: AlertChannel = { ...input, id: genId('alert') };
      db.alertChannels.push(channel);
      return channel;
    });
  }
  const { data } = await apiClient.post('/alert-channels/', input);
  return data;
}

export async function deleteAlertChannel(id: string): Promise<void> {
  if (USE_MOCK) {
    await mockDb.mutate((db) => {
      db.alertChannels = db.alertChannels.filter((a) => a.id !== id);
    });
    return;
  }
  await apiClient.delete(`/alert-channels/${id}/`);
}
