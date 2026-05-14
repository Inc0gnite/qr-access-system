// Servicio para puertas
import api from './api';
import { Door } from '@/types';

interface DoorPayload {
  nombre: string;
  ubicacion: string;
}

export const doorsService = {
  list: () => api.get<Door[]>('/api/doors'),
  listAll: () => api.get<Door[]>('/api/doors/all'),
  create: (data: DoorPayload) => api.post<Door>('/api/doors', data),
  update: (id: string, data: DoorPayload) => api.put<Door>(`/api/doors/${id}`, data),
  toggle: (id: string) => api.patch<Door>(`/api/doors/${id}/toggle`),
  remove: (id: string) => api.delete(`/api/doors/${id}`),
};
