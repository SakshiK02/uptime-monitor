import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/monitors';
import type { MonitorInput } from '../api/monitors';

export function useMonitors() {
  return useQuery({ queryKey: ['monitors'], queryFn: api.listMonitors, refetchInterval: 15_000 });
}

export function useMonitor(id: string) {
  return useQuery({ queryKey: ['monitors', id], queryFn: () => api.getMonitor(id), enabled: !!id });
}

export function useMonitorChecks(id: string, hours = 24) {
  return useQuery({ queryKey: ['monitors', id, 'checks', hours], queryFn: () => api.listMonitorChecks(id, hours), enabled: !!id });
}

export function useCreateMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MonitorInput) => api.createMonitor(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monitors'] }),
  });
}

export function useUpdateMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MonitorInput }) => api.updateMonitor(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monitors'] }),
  });
}

export function useDeleteMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteMonitor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monitors'] }),
  });
}
