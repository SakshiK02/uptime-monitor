import type { Check } from '../types/api';

export function uptimePercent(checks: Check[]): number {
  if (checks.length === 0) return 100;
  const up = checks.filter((c) => c.status === 'up').length;
  return Math.round((up / checks.length) * 1000) / 10;
}

export function averageResponseTime(checks: Check[]): number | null {
  const withTiming = checks.filter((c) => c.responseTimeMs != null);
  if (withTiming.length === 0) return null;
  const total = withTiming.reduce((sum, c) => sum + (c.responseTimeMs ?? 0), 0);
  return Math.round(total / withTiming.length);
}
