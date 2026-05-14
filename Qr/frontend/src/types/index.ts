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

export interface Door {
  id: string;
  nombre: string;
  ubicacion: string;
  activa: boolean;
}

export interface ScanPayload {
  qr_token: string;
  door_id: string;
}

export interface ScanResult {
  success: boolean;
  tipo: 'entrada' | 'salida';
  person: {
    id: string;
    nombre: string;
    tipo: PersonTipo;
    foto_url: string | null;
  };
  door: { id: string; nombre: string };
  timestamp: string;
}

export interface AccessLog {
  id: string;
  person_id: string;
  door_id: string;
  tipo: 'entrada' | 'salida';
  timestamp: string;
}

export interface LiveLog {
  id: string;
  tipo: 'entrada' | 'salida';
  timestamp: string;
  person: {
    id: string;
    nombre: string;
    tipo: PersonTipo;
    foto_url: string | null;
  };
  door: { id: string; nombre: string };
}

export interface InsideEntry {
  person: {
    id: string;
    nombre: string;
    tipo: PersonTipo;
    foto_url: string | null;
  };
  door: { id: string; nombre: string };
  since: string;
}

export interface Alert {
  id: string;
  tipo: 'qr_invalido' | 'fuera_horario' | 'sin_salida';
  mensaje: string;
  leida: boolean;
  created_at: string;
  person: { id: string; nombre: string } | null;
}

export interface AttendanceRecord {
  person: {
    id: string;
    nombre: string;
    tipo: PersonTipo;
  };
  sessions: number;
  total_minutes: number;
  days: number;
}
