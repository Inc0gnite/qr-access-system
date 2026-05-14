// Página de inicio de sesión
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { loginRequest } from '@/services/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await loginRequest({ email, password });
      login(user, token);
      navigate(user.rol === 'admin' ? '/dashboard' : '/scanner', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al iniciar sesión. Intente de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md">

        {/* Logo y título */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-accent-light rounded-card flex items-center justify-center mb-4">
            <Shield className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">QR Access Control</h1>
          <p className="text-text-secondary text-sm mt-1">Sistema de control de acceso</p>
        </div>

        {/* Formulario */}
        <div className="card">
          <h2 className="text-lg font-medium text-text-primary mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-text-secondary text-xs mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base pl-9"
                  placeholder="admin@empresa.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-xs mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base pl-9"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 rounded-component px-3 py-2 text-error text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-xs mt-6">
          Credenciales de prueba: <span className="text-text-primary">admin@empresa.com</span> / password123
        </p>
      </div>
    </div>
  );
}
