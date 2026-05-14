// Hooks de TanStack Query para alertas
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsService } from '@/services/alerts';

export function useAlerts(params: { leida?: boolean } = {}) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => alertsService.list(params).then((r) => r.data),
  });
}

// Conteo de alertas sin leer — usado para el badge en el sidebar (poll cada 15s)
export function useUnreadAlertsCount(enabled = true) {
  return useQuery({
    queryKey: ['alerts', 'unread', 'count'],
    queryFn: () => alertsService.list({ leida: false }).then((r) => r.data.length),
    refetchInterval: 15000,
    enabled,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsService.markAsRead(id).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => alertsService.markAllAsRead().then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}
