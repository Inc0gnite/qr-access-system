// Panel principal — placeholder hasta Fase 5 (panel en tiempo real)
import { LayoutDashboard } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
      </div>
      <div className="card max-w-lg">
        <p className="text-text-secondary text-sm">
          Fase 5 — Panel en tiempo real con polling próximamente.
        </p>
      </div>
    </div>
  );
}
