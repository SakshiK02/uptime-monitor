import { useQuery } from '@tanstack/react-query';
import { listIncidents } from '../api/incidents';

export function useIncidents(monitorId?: string) {
  return useQuery({ queryKey: ['incidents', monitorId ?? 'all'], queryFn: () => listIncidents(monitorId) });
}
