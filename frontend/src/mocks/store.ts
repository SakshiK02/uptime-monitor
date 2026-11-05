import type { AlertChannel, Check, Incident, Monitor, User } from '../types/api';

const STORAGE_KEY = 'uptime_mock_db';
const LATENCY_MS = 250;

interface MockDb {
  user: User;
  monitors: Monitor[];
  checks: Check[];
  incidents: Incident[];
  alertChannels: AlertChannel[];
}

function seed(): MockDb {
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();

  const monitors: Monitor[] = [
    { id: 'mon-1', name: 'Portfolio site', url: 'https://my-portfolio-site.com', intervalMinutes: 5, isActive: true, createdAt: iso(now - 7 * 86400000), currentStatus: 'up', lastCheckedAt: iso(now - 2 * 60000) },
    { id: 'mon-2', name: 'API server', url: 'https://api.my-app.com/health', intervalMinutes: 5, isActive: true, createdAt: iso(now - 5 * 86400000), currentStatus: 'down', lastCheckedAt: iso(now - 1 * 60000) },
    { id: 'mon-3', name: 'Marketing page', url: 'https://my-app.com', intervalMinutes: 10, isActive: true, createdAt: iso(now - 3 * 86400000), currentStatus: 'up', lastCheckedAt: iso(now - 4 * 60000) },
  ];

  const checks: Check[] = [];
  const incidents: Incident[] = [];

  // mon-1: healthy for 24h, response time wobbling a bit
  for (let i = 288; i >= 0; i--) {
    const t = now - i * 5 * 60000;
    checks.push({ id: `chk-${monitors[0].id}-${i}`, monitorId: monitors[0].id, timestamp: iso(t), status: 'up', responseTimeMs: 120 + Math.round(Math.random() * 60), statusCode: 200 });
  }

  // mon-2: healthy, then an outage ~3h ago lasting 25 min, now down again (ongoing)
  for (let i = 288; i >= 0; i--) {
    const t = now - i * 5 * 60000;
    const minutesAgo = i * 5;
    const inPastOutage = minutesAgo >= 170 && minutesAgo <= 195;
    const isOngoingOutage = minutesAgo <= 10;
    const isDown = inPastOutage || isOngoingOutage;
    checks.push({
      id: `chk-${monitors[1].id}-${i}`,
      monitorId: monitors[1].id,
      timestamp: iso(t),
      status: isDown ? 'down' : 'up',
      responseTimeMs: isDown ? null : 200 + Math.round(Math.random() * 100),
      statusCode: isDown ? 0 : 200,
    });
  }
  incidents.push({ id: 'inc-1', monitorId: monitors[1].id, startedAt: iso(now - 195 * 60000), resolvedAt: iso(now - 170 * 60000), cause: 'Connection timeout' });
  incidents.push({ id: 'inc-2', monitorId: monitors[1].id, startedAt: iso(now - 10 * 60000), resolvedAt: null, cause: 'HTTP 503 Service Unavailable' });

  // mon-3: fully healthy
  for (let i = 144; i >= 0; i--) {
    const t = now - i * 10 * 60000;
    checks.push({ id: `chk-${monitors[2].id}-${i}`, monitorId: monitors[2].id, timestamp: iso(t), status: 'up', responseTimeMs: 80 + Math.round(Math.random() * 40), statusCode: 200 });
  }

  const alertChannels: AlertChannel[] = [
    { id: 'alert-1', type: 'email', target: 'demo@pingwatch.app', isEnabled: true },
  ];

  return {
    user: { id: 'user-1', username: 'demo', email: 'demo@pingwatch.app' },
    monitors,
    checks,
    incidents,
    alertChannels,
  };
}

function load(): MockDb {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as MockDb;
    } catch {
      /* fall through to reseed */
    }
  }
  const db = seed();
  save(db);
  return db;
}

function save(db: MockDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

export const mockDb = {
  async getAll(): Promise<MockDb> {
    return delay(load());
  },
  async mutate<T>(fn: (db: MockDb) => T): Promise<T> {
    const db = load();
    const result = fn(db);
    save(db);
    return delay(result);
  },
  resetToSeed(): void {
    save(seed());
  },
};

export function genId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
