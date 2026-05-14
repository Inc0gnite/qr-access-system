// Servicios para alertas
import api from './api';
import { Alert } from '@/types';

export const alertsService = {
  list: (params?: { leida?: boolean }) =>
    api.get<Alert[]>('/api/alerts', { params }),

  markAsRead: (id: string) =>
    api.patch<Alert>(`/api/alerts/${id}/read`),

  markAllAsRead: () =>
    api.patch<{ message: string }>('/api/alerts/read-all'),
};
