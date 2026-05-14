// Página de reportes: asistencia por persona en rango de fechas + exportación Excel
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Search } from 'lucide-react';
import { reportsService } from '@/services/reports';
import { AttendanceRecord, PersonTipo } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6); // últimos 7 días
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function formatMinutes(minutes: number): string {
  if (minutes === 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const TIPO_LABEL: Record<PersonTipo, string> = {
  empleado: 'Empleado',
  visitante: 'Visitante',
  contratista: 'Contratista',
};

const TIPO_CLASS: Record<PersonTipo, string> = {
  empleado: 'bg-accent/10 text-accent',
  visitante: 'bg-info/10 text-info',
  contratista: 'bg-warning/10 text-warning',
};

// ─── Fila de la tabla ─────────────────────────────────────────────────────────

function RecordRow({ record }: { record: AttendanceRecord }) {
  return (
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-text-primary text-sm font-medium">{record.person.nombre}</p>
      </td>
      <td className="px-4 py-3.5">
        <span className={`badge ${TIPO_CLASS[record.person.tipo]}`}>
          {TIPO_LABEL[record.person.tipo]}
        </span>
      </td>
      <td className="px-4 py-3.5 text-text-primary text-sm text-center">{record.days}</td>
      <td className="px-4 py-3.5 text-text-primary text-sm text-center">{record.sessions}</td>
      <td className="px-5 py-3.5 text-text-primary text-sm text-right tabular-nums">
        {formatMinutes(record.total_minutes)}
      </td>
    </tr>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const defaults = defaultDateRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [queryRange, setQueryRange] = useState(defaults);
  const [isExporting, setIsExporting] = useState(false);

  const { data: records = [], isLoading, isFetching } = useQuery({
    queryKey: ['reports', 'attendance', queryRange.from, queryRange.to],
    queryFn: () =>
      reportsService.getAttendance(queryRange.from, queryRange.to).then((r) => r.data),
  });

  function handleGenerate() {
    setQueryRange({ from, to });
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const response = await reportsService.exportExcel(queryRange.from, queryRange.to);
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `asistencia_${queryRange.from}_${queryRange.to}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  const totalSessions = records.reduce((s, r) => s + r.sessions, 0);
  const totalMinutes = records.reduce((s, r) => s + r.total_minutes, 0);

  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-semibold text-text-primary">Reportes</h1>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-bg-card border border-white/[0.07] rounded-card p-5 mb-5">
        <p className="text-text-secondary text-xs font-medium mb-3 uppercase tracking-wide">
          Rango de fechas
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-text-secondary text-xs">Desde</label>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="input-base w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-text-secondary text-xs">Hasta</label>
            <input
              type="date"
              value={to}
              min={from}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setTo(e.target.value)}
              className="input-base w-40"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isFetching}
            className="btn-primary flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            Generar
          </button>
          {records.length > 0 && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Exportando...' : 'Exportar a Excel'}
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-bg-card border border-white/[0.07] rounded-card px-5 py-4">
            <p className="text-text-secondary text-xs mb-1">Personas activas</p>
            <p className="text-text-primary text-2xl font-semibold">{records.length}</p>
          </div>
          <div className="bg-bg-card border border-white/[0.07] rounded-card px-5 py-4">
            <p className="text-text-secondary text-xs mb-1">Sesiones totales</p>
            <p className="text-text-primary text-2xl font-semibold">{totalSessions}</p>
          </div>
          <div className="bg-bg-card border border-white/[0.07] rounded-card px-5 py-4">
            <p className="text-text-secondary text-xs mb-1">Horas registradas</p>
            <p className="text-text-primary text-2xl font-semibold">
              {formatMinutes(totalMinutes)}
            </p>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-bg-card border border-white/[0.07] rounded-card overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-text-secondary text-sm">Cargando...</div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-8 h-8 text-text-secondary mx-auto mb-2" />
            <p className="text-text-secondary text-sm">
              Selecciona un rango de fechas y presiona Generar
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="text-left text-text-secondary text-xs font-medium px-5 py-3">
                  Nombre
                </th>
                <th className="text-left text-text-secondary text-xs font-medium px-4 py-3">
                  Tipo
                </th>
                <th className="text-center text-text-secondary text-xs font-medium px-4 py-3">
                  Días
                </th>
                <th className="text-center text-text-secondary text-xs font-medium px-4 py-3">
                  Sesiones
                </th>
                <th className="text-right text-text-secondary text-xs font-medium px-5 py-3">
                  Horas
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <RecordRow key={record.person.id} record={record} />
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {records.length > 0 && (
        <p className="text-text-secondary text-xs mt-3">
          {records.length} {records.length === 1 ? 'persona' : 'personas'} · período{' '}
          {queryRange.from} — {queryRange.to}
        </p>
      )}
    </div>
  );
}
