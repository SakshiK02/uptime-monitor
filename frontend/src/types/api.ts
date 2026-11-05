export type MonitorStatus = 'up' | 'down' | 'pending';

export type AlertChannelType = 'email' | 'telegram' | 'ntfy';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  intervalMinutes: number;
  isActive: boolean;
  createdAt: string;
  currentStatus: MonitorStatus;
  lastCheckedAt: string | null;
}

export interface Check {
  id: string;
  monitorId: string;
  timestamp: string; // ISO datetime
  status: 'up' | 'down';
  responseTimeMs: number | null;
  statusCode: number | null;
}

export interface Incident {
  id: string;
  monitorId: string;
  startedAt: string;
  resolvedAt: string | null;
  cause: string;
}

export interface AlertChannel {
  id: string;
  type: AlertChannelType;
  target: string; // email address or telegram chat id
  isEnabled: boolean;
}
