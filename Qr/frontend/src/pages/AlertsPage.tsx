// Página de alertas de seguridad con filtros y acción de marcar como leída
import { useState } from 'react';
import { Bell, CheckCheck, CheckCircle } from 'lucide-react';
import { Alert } from '@/types';
import { useAlerts, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useAlerts';

// ─── Config visual por tipo ────────────────────────────────────────────────────

const TIPO_CONFIG: Record<string, { label: string; className: string }> = {
  qr_invalido: { label: 'QR inválido', className: 'bg-error/10 text-error' },
  fuera_horario: { label: 'Fuera de horario', className: 'bg-warning/10 text-warning' },
  sin_salida: { label: 'Sin salida', className: 'bg-info/10 text-info' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();
  if (isToday) {
    return `Hoy ${date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Fila de alerta ────────────────────────────────────────────────────────────

function AlertRow({ alert, onRead }: { alert: Alert; onRead: (id: string) => void }) {
  const config = TIPO_CONFIG[alert.tipo] ?? {
    label: alert.tipo,
    className: 'bg-white/10 text-text-secondary',
  };

  return (
    <tr
      className={`border-b border-white/[0.04] transition-colors ${
        alert.leida ? 'opacity-50' : 'hover:bg-white/[0.02]'
      }`}
    >
      {/* Tipo */}
      <td className="px-5 py-3.5 w-36">
        <span className={`badge ${config.className}`}>{config.label}</span>
      </td>

      {/* Mensaje */}
      <td className="px-4 py-3.5">
        <p className="text-text-primary text-sm">{alert.mensaje}</p>
        {alert.person && (
          <p className="text-text-secondary text-xs mt-0.5">{alert.person.nombre}</p>
        )}
      </td>

      {/* Fecha */}
      <td className="px-4 py-3.5 text-text-secondary text-xs whitespace-nowrap">
        {formatDate(alert.created_at)}
      </td>

      {/* Acción */}
      <td className="px-5 py-3.5 text-right">
        {!alert.leida && (
          <button
            onClick={() => onRead(alert.id)}
            title="Marcar como leída"
            className="p-1.5 text-text-secondary hover:text-success hover:bg-success/10 rounded-component transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

type FilterValue = '' | 'true' | 'false';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'false', label: 'Sin leer' },
  { value: '', label: 'Todas' },
  { value: 'true', label: 'Leídas' },
];

export function AlertsPage() {
  const [filter, setFilter] = useState<FilterValue>('false');

  const alertParams = filter === '' ? {} : { leida: filter === 'true' };
  const { data: alerts = [], isLoading } = useAlerts(alertParams);

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = alerts.filter((a) => !a.leida).length;
  const hasUnread = filter !== 'true' && unreadCount > 0;

  function handleMarkAllAsRead() {
    markAllAsRead.mutate();
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-semibold text-text-primary">Alertas</h1>
          {hasUnread && (
            <span className="badge bg-error/15 text-error">
              {unreadCount} sin leer
            </span>
          )}
        </div>
        <button
          onClick={handleMarkAllAsRead}
          disabled={!hasUnread || markAllAsRead.isPending}
          className="btn-secondary flex items-center gap-2 text-xs disabled:opacity-40"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Marcar todas como leídas
        </button>
      </div>

      {/* Filtro */}
      <div className="flex gap-1 mb-5 bg-bg-secondary border border-white/[0.07] rounded-component p-1 w-fit">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === value
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-bg-card border border-white/[0.07] rounded-card overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-text-secondary text-sm">Cargando...</div>
        ) : alerts.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCheck className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-text-secondary text-sm">
              {filter === 'false' ? 'Sin alertas pendientes' : 'Sin alertas'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="text-left text-text-secondary text-xs font-medium px-5 py-3">
                  Tipo
                </th>
                <th className="text-left text-text-secondary text-xs font-medium px-4 py-3">
                  Mensaje
                </th>
                <th className="text-left text-text-secondary text-xs font-medium px-4 py-3">
                  Fecha
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  onRead={(id) => markAsRead.mutate(id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {alerts.length > 0 && (
        <p className="text-text-secondary text-xs mt-3">
          {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}
        </p>
      )}
    </div>
  );
}
