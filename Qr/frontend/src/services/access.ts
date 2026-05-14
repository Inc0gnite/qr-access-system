// Servicio para el escaneo de QR y registro de accesos
import api from './api';
import { ScanPayload, ScanResult } from '@/types';

export const accessService = {
  scan: (payload: ScanPayload) =>
    api.post<ScanResult>('/api/access/scan', payload),
};
