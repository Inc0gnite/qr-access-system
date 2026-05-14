// Hooks de TanStack Query para personas
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personsService, PersonFilters } from '@/services/persons';
import { PersonFormData } from '@/types';

export function usePersons(filters?: PersonFilters) {
  return useQuery({
    queryKey: ['persons', filters],
    queryFn: () => personsService.list(filters).then((r) => r.data),
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PersonFormData, 'activo'>) =>
      personsService.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persons'] }),
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PersonFormData> }) =>
      personsService.update(id, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persons'] }),
  });
}

export function useRemovePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => personsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persons'] }),
  });
}
