// Página del escáner QR para el rol guardia — placeholder hasta Fase 4
import { useNavigate } from 'react-router-dom';
import { LogOut, QrCode } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function ScannerPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="bg-bg-secondary border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <QrCode className="w-5 h-5 text-accent" />
          <span className="text-text-primary font-medium">QR Access Control</span>
          <span className="badge bg-accent-light text-accent ml-1">Guardia</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-text-secondary text-sm">{user?.email}</span>
          <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-xs">
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </button>
        </div>
      </nav>

      <main className="p-6">
        <div className="card max-w-lg">
          <h1 className="text-xl font-semibold text-text-primary mb-2">Escáner QR</h1>
          <p className="text-text-secondary text-sm">
            Bienvenido,{' '}
            <span className="text-text-primary">{user?.email}</span>.
          </p>
          <p className="text-text-secondary text-xs mt-4 text-info">
            Fase 4 — Escáner y registro de accesos próximamente.
          </p>
        </div>
      </main>
    </div>
  );
}
