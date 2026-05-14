// Página del escáner QR — placeholder hasta Fase 4
import { QrCode } from 'lucide-react';

export function ScannerPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <QrCode className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-semibold text-text-primary">Escáner QR</h1>
      </div>
      <div className="card max-w-lg">
        <p className="text-text-secondary text-sm">
          Fase 4 — Escáner con cámara y registro de accesos próximamente.
        </p>
      </div>
    </div>
  );
}
