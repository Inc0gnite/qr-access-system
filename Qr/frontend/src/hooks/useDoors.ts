// Hooks de TanStack Query para puertas
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doorsService } from '@/services/doors';

// Lista de puertas activas — usada por el scanner
export function useDoors() {
  return useQuery({
    queryKey: ['doors'],
    queryFn: () => doorsService.list().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

// Todas las puertas — usada por la página de gestión (admin)
export function useAllDoors() {
  return useQuery({
    queryKey: ['doors', 'all'],
    queryFn: () => doorsService.listAll().then((r) => r.data),
  });
}

export function useCreateDoor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nombre: string; ubicacion: string }) => doorsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doors'] }),
  });
}

export function useUpdateDoor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nombre: string; ubicacion: string } }) =>
      doorsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doors'] }),
  });
}

export function useToggleDoor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => doorsService.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doors'] }),
  });
}

export function useDeleteDoor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => doorsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doors'] }),
  });
}
