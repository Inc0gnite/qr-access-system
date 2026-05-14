// Tipos TypeScript compartidos en el frontend

export interface User {
  id: string;
  email: string;
  rol: 'admin' | 'guardia';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface Person {
  id: string;
  nombre: string;
  tipo: 'empleado' | 'visitante' | 'contratista';
  qr_token: string;
  foto_url: string | null;
  activo: boolean;
  created_at: string;
}

export type PersonTipo = Person['tipo'];

export interface PersonFormData {
  nombre: string;
  tipo: PersonTipo;
  foto_url?: string | null;
  activo?: boolean;
}
