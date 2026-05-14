// Dashboard en tiempo real con polling cada 5 segundos
import type { LucideIcon } from 'lucide-react';
import { Activity, Clock, RefreshCw, Users } from 'lucide-react';
import { LiveLog, InsideEntry } from '@/types';
import { useLiveAccess, useInsidePersons } from '@/hooks/useAccess';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();
  if (isToday) {
    return date.toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  return date.toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeSince(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `hace ${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `hace ${mins}m`;
  return `hace ${Math.floor(mins / 60)}h`;
}

function Avatar({ name, fotoUrl }: { name: string; fotoUrl: string | null }) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
      <span className="text-accent text-xs font-semibold">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

// ─── Sub-componentes ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  mono = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-bg-card border border-white/[0.07] rounded-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-text-secondary text-xs">{label}</span>
      </div>
      <p className={`font-semibold text-text-primary ${mono ? 'text-lg font-mono' : 'text-3xl'}`}>
        {value}
      </p>
    </div>
  );
}

function InsideCard({ entry }: { entry: InsideEntry }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
      <Avatar name={entry.person.nombre} fotoUrl={entry.person.foto_url} />
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{entry.person.nombre}</p>
        <p className="text-text-secondary text-xs capitalize">{entry.person.tipo}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-text-secondary text-xs truncate max-w-24">{entry.door.nombre}</p>
        <p className="text-text-secondary text-xs">{timeSince(entry.since)}</p>
      </div>
    </div>
  );
}

function LiveRow({ log }: { log: LiveLog }) {
  const isEntrada = log.tipo === 'entrada';
  return (
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      <td className="px-5 py-3">
        <span
          className={`badge ${isEntrada ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
        >
          {log.tipo.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar name={log.person.nombre} fotoUrl={log.person.foto_url} />
          <div>
            <p className="text-text-primary text-sm leading-tight">{log.person.nombre}</p>
            <p className="text-text-secondary text-xs capitalize">{log.person.tipo}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-text-secondary text-sm">{log.door.nombre}</td>
      <td className="px-5 py-3 text-right text-text-secondary text-xs font-mono tabular-nums">
        {formatTime(log.timestamp)}
      </td>
    </tr>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data: liveAccess = [], isFetching: fetchingLive } = useLiveAccess();
  const { data: inside = [], isFetching: fetchingInside } = useInsidePersons();
  const isFetching = fetchingLive || fetchingInside;

  const lastActivity = liveAccess[0]?.timestamp;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary text-xs mt-0.5">
            Actualización automática cada 5 segundos
          </p>
        </div>
        <div className="flex items-center gap-2 text-text-secondary text-xs">
          <RefreshCw
            className={`w-3.5 h-3.5 transition-colors ${isFetching ? 'animate-spin text-accent' : ''}`}
          />
          <span>{isFetching ? 'Actualizando...' : 'En vivo'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Dentro ahora"
          value={inside.length}
          color="text-accent"
        />
        <StatCard
          icon={Activity}
          label="Accesos recientes"
          value={liveAccess.length}
          color="text-info"
        />
        <StatCard
          icon={Clock}
          label="Última actividad"
          value={lastActivity ? formatTime(lastActivity) : '—'}
          color="text-success"
          mono
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-5 gap-4">

        {/* Dentro ahora */}
        <div className="col-span-2 bg-bg-card border border-white/[0.07] rounded-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
            <h2 className="text-text-primary text-sm font-medium">Dentro ahora</h2>
            <span className="badge bg-accent-light text-accent">{inside.length}</span>
          </div>
          {inside.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-text-secondary text-sm">Sin personas registradas dentro</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04] overflow-y-auto">
              {inside.map((entry) => (
                <InsideCard key={entry.person.id} entry={entry} />
              ))}
            </div>
          )}
        </div>

        {/* Feed de accesos */}
        <div className="col-span-3 bg-bg-card border border-white/[0.07] rounded-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
            <h2 className="text-text-primary text-sm font-medium">Accesos recientes</h2>
            <span className="text-text-secondary text-xs">
              {liveAccess.length > 0 ? `Últimos ${liveAccess.length}` : ''}
            </span>
          </div>
          {liveAccess.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-text-secondary text-sm">Sin registros de acceso</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="text-left text-text-secondary text-xs font-medium px-5 py-2.5">
                      Tipo
                    </th>
                    <th className="text-left text-text-secondary text-xs font-medium px-4 py-2.5">
                      Persona
                    </th>
                    <th className="text-left text-text-secondary text-xs font-medium px-4 py-2.5">
                      Puerta
                    </th>
                    <th className="text-right text-text-secondary text-xs font-medium px-5 py-2.5">
                      Hora
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {liveAccess.map((log) => (
                    <LiveRow key={log.id} log={log} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
