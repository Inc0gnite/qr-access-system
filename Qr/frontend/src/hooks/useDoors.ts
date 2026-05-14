// Hook de TanStack Query para puertas activas
import { useQuery } from '@tanstack/react-query';
import { doorsService } from '@/services/doors';

export function useDoors() {
  return useQuery({
    queryKey: ['doors'],
    queryFn: () => doorsService.list().then((r) => r.data),
    staleTime: 1000 * 60 * 5, // las puertas cambian poco; cachear 5 minutos
  });
}
