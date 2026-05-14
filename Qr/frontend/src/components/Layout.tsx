import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, DoorOpen, FileText, LayoutDashboard, LogOut, Menu, QrCode, Users, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUnreadAlertsCount } from '@/hooks/useAlerts';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/personas', icon: Users, label: 'Personas' },
  { to: '/alertas', icon: Bell, label: 'Alertas' },
  { to: '/reportes', icon: FileText, label: 'Reportes' },
  { to: '/puertas', icon: DoorOpen, label: 'Puertas' },
  { to: '/scanner', icon: QrCode, label: 'Escáner QR' },
];

const guardiaLinks = [
  { to: '/scanner', icon: QrCode, label: 'Escáner QR' },
];

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const links = user?.rol === 'admin' ? adminLinks : guardiaLinks;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: unreadCount = 0 } = useUnreadAlertsCount(user?.rol === 'admin');

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 h-14 bg-bg-secondary border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain flex-shrink-0" />
          <span className="text-text-primary font-semibold text-sm">QR Access Control</span>
        </div>
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Menú"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-bg-secondary border-r border-white/[0.07] flex flex-col fixed inset-y-0 left-0 z-20 transition-transform duration-200 ease-in-out
          md:translate-x-0 md:z-10
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo — hidden on mobile (top bar handles it) */}
        <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-white/[0.07]">
          <img src="/logo.png" alt="Logo" className="w-9 h-9 flex-shrink-0 object-contain" />
          <span className="text-text-primary font-semibold text-sm leading-tight">
            QR Access<br />
            <span className="text-text-secondary font-normal text-xs">Control</span>
          </span>
        </div>

        {/* Spacer on mobile to push nav below top bar */}
        <div className="md:hidden h-14 flex-shrink-0" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-component text-sm transition-colors duration-150 ${
                  isActive
                    ? 'bg-accent-light text-accent font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
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
      <main className="md:ml-64 flex-1 min-h-screen overflow-y-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
