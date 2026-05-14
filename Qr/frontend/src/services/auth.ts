// Servicios de autenticación
import api from './api';
import { LoginCredentials, LoginResponse } from '@/types';

export async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', credentials);
  return data;
}
