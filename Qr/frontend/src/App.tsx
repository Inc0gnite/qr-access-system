import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder de páginas — se completarán en fases siguientes
function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card text-center">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">QR Access Control</h1>
        <p className="text-text-secondary text-sm">Sistema de control de acceso con QR</p>
        <p className="text-accent text-xs mt-4">Fase 2 — Autenticación próximamente</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
