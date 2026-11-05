import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/alertChannels';
import type { AlertChannelInput } from '../api/alertChannels';

export function useAlertChannels() {
  return useQuery({ queryKey: ['alert-channels'], queryFn: api.listAlertChannels });
}

export function useCreateAlertChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AlertChannelInput) => api.createAlertChannel(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alert-channels'] }),
  });
}

export function useDeleteAlertChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAlertChannel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alert-channels'] }),
  });
}
