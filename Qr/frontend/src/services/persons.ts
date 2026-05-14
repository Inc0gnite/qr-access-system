// Servicios para el CRUD de personas y descarga de QR
import api from './api';
import { Person, PersonFormData } from '@/types';

export interface PersonFilters {
  search?: string;
  tipo?: string;
  activo?: string;
}

export const personsService = {
  list: (filters?: PersonFilters) =>
    api.get<Person[]>('/api/persons', { params: filters }),

  getById: (id: string) =>
    api.get<Person>(`/api/persons/${id}`),

  create: (data: Omit<PersonFormData, 'activo'>) =>
    api.post<Person>('/api/persons', data),

  update: (id: string, data: Partial<PersonFormData>) =>
    api.put<Person>(`/api/persons/${id}`, data),

  remove: (id: string) =>
    api.delete(`/api/persons/${id}`),

  // Descarga la imagen QR como blob (requiere auth via interceptor de Axios)
  downloadQr: (id: string) =>
    api.get(`/api/persons/${id}/qr`, { responseType: 'blob' }),
};
