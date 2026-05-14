// Servicio para puertas
import api from './api';
import { Door } from '@/types';

export const doorsService = {
  list: () => api.get<Door[]>('/api/doors'),
};
