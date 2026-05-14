// Servicio de reportes: asistencia y exportación Excel
import api from './api';
import { AttendanceRecord } from '@/types';

export const reportsService = {
  getAttendance(from: string, to: string) {
    return api.get<AttendanceRecord[]>('/api/reports/attendance', { params: { from, to } });
  },

  exportExcel(from: string, to: string) {
    return api.get('/api/reports/export', {
      params: { from, to },
      responseType: 'blob',
    });
  },
};
