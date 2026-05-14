// Servicio para accesos: escaneo, feed en vivo y personas dentro
import api from './api';
import { ScanPayload, ScanResult, LiveLog, InsideEntry } from '@/types';

export const accessService = {
  scan: (payload: ScanPayload) =>
    api.post<ScanResult>('/api/access/scan', payload),

  live: () =>
    api.get<LiveLog[]>('/api/access/live'),

  inside: () =>
    api.get<InsideEntry[]>('/api/access/inside'),
};
