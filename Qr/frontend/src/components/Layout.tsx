// Layout principal con sidebar para todas las páginas autenticadas
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, LayoutDashboard, LogOut, QrCode, Shield, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUnreadAlertsCount } from '@/hooks/useAlerts';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/personas', icon: Users, label: 'Personas' },
  { to: '/alertas', icon: Bell, label: 'Alertas' },
  { to: '/scanner', icon: QrCode, label: 'Escáner QR' },
];

const guardiaLinks = [
  { to: '/scanner', icon: QrCode, label: 'Escáner QR' },
];

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const links = user?.rol === 'admin' ? adminLinks : guardiaLinks;

  // Badge de alertas — solo para admin; poll cada 15s
  const { data: unreadCount = 0 } = useUnreadAlertsCount(user?.rol === 'admin');

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">

      {/* Sidebar */}
      <aside className="w-60 bg-bg-secondary border-r border-white/[0.07] flex flex-col fixed inset-y-0 left-0 z-10">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.07]">
          <div className="w-8 h-8 bg-accent-light rounded-component flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-accent" />
          </div>
          <span className="text-text-primary font-semibold text-sm leading-tight">
            QR Access<br />
            <span className="text-text-secondary font-normal text-xs">Control</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-component text-sm transition-colors duration-150 ${
                  isActive
                    ? 'bg-accent-light text-accent font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {/* Badge de alertas sin leer */}
              {to === '/alertas' && unreadCount > 0 && (
                <span className="flex items-center justify-center bg-error text-white text-[10px] font-semibold rounded-full min-w-4 h-4 px-1 leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="px-3 py-4 border-t border-white/[0.07]">
          <div className="px-3 py-2 mb-1">
            <p className="text-text-primary text-xs font-medium truncate">{user?.email}</p>
            <p className="text-text-secondary text-xs capitalize mt-0.5">{user?.rol}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-component text-sm transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
