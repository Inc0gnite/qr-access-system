// Hooks de TanStack Query para el dashboard en tiempo real (polling cada 5s)
import { useQuery } from '@tanstack/react-query';
import { accessService } from '@/services/access';

export function useLiveAccess() {
  return useQuery({
    queryKey: ['access', 'live'],
    queryFn: () => accessService.live().then((r) => r.data),
    refetchInterval: 5000,
  });
}

export function useInsidePersons() {
  return useQuery({
    queryKey: ['access', 'inside'],
    queryFn: () => accessService.inside().then((r) => r.data),
    refetchInterval: 5000,
  });
}
