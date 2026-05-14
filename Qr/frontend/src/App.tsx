import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ScannerPage } from '@/pages/ScannerPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const defaultAuthed = user?.rol === 'admin' ? '/dashboard' : '/scanner';

  return (
    <BrowserRouter>
      <Routes>
        {/* Login — redirige al panel si ya hay sesión activa */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={defaultAuthed} replace /> : <LoginPage />}
        />

        {/* Rutas solo para admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Rutas para ambos roles */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'guardia']} />}>
          <Route path="/scanner" element={<ScannerPage />} />
        </Route>

        {/* Raíz — redirige según estado de sesión */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={defaultAuthed} replace />
              : <Navigate to="/login" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
