import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ScannerPage } from '@/pages/ScannerPage';
import { PersonsPage } from '@/pages/PersonsPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const defaultAuthed = user?.rol === 'admin' ? '/dashboard' : '/scanner';

  return (
    <BrowserRouter>
      <Routes>
        {/* Login — redirige si ya hay sesión activa */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={defaultAuthed} replace /> : <LoginPage />}
        />

        {/* Todas las rutas autenticadas comparten el Layout con sidebar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            {/* Solo admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/personas" element={<PersonsPage />} />
            </Route>

            {/* Ambos roles */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'guardia']} />}>
              <Route path="/scanner" element={<ScannerPage />} />
            </Route>

          </Route>
        </Route>

        {/* Raíz — redirige según estado */}
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
