import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore.js';
import { authApi } from '../../services/api.js';
import toast from 'react-hot-toast';

// ─── Role → nav items mapping ─────────────────────────────
const NAV = {
  common: [
    { to: '/dashboard',    icon: '⊞', label: 'Dashboard' },
    { to: '/appointments', icon: '📅', label: 'Appointments' },
  ],
  admin: [
    { to: '/patients',     icon: '🧑‍⚕️', label: 'Patients' },
    { to: '/doctors',      icon: '👨‍⚕️', label: 'Doctors' },
    { to: '/records',      icon: '📋', label: 'Records' },
    { to: '/prescriptions',icon: '💊', label: 'Prescriptions' },
    { to: '/lab-orders',   icon: '🔬', label: 'Lab Orders' },
    { to: '/pharmacy',     icon: '🏥', label: 'Pharmacy' },
    { to: '/billing',      icon: '💳', label: 'Billing' },
  ],
  doctor: [
    { to: '/patients',     icon: '🧑‍⚕️', label: 'My Patients' },
    { to: '/records',      icon: '📋', label: 'Records' },
    { to: '/prescriptions',icon: '💊', label: 'Prescriptions' },
    { to: '/lab-orders',   icon: '🔬', label: 'Lab Orders' },
  ],
  nurse: [
    { to: '/patients',     icon: '🧑‍⚕️', label: 'Patients' },
    { to: '/records',      icon: '📋', label: 'Records' },
    { to: '/lab-orders',   icon: '🔬', label: 'Lab Orders' },
  ],
  receptionist: [
    { to: '/patients',     icon: '🧑‍⚕️', label: 'Patients' },
    { to: '/doctors',      icon: '👨‍⚕️', label: 'Doctors' },
  ],
  pharmacist: [
    { to: '/pharmacy',     icon: '🏥', label: 'Pharmacy' },
    { to: '/prescriptions',icon: '💊', label: 'Prescriptions' },
  ],
  lab_tech: [
    { to: '/lab-orders',   icon: '🔬', label: 'Lab Orders' },
  ],
  patient: [
    { to: '/doctors',      icon: '👨‍⚕️', label: 'Find a Doctor' },
    { to: '/records',      icon: '📋', label: 'My Records' },
    { to: '/prescriptions',icon: '💊', label: 'My Prescriptions' },
    { to: '/billing',      icon: '💳', label: 'Billing' },
  ]
};

const ROLE_COLORS = {
  admin: 'bg-brand-50 text-brand-600',
  doctor: 'bg-teal-50 text-teal-600',
  nurse: 'bg-purple-50 text-purple-700',
  receptionist: 'bg-amber-50 text-amber-700',
  pharmacist: 'bg-green-50 text-green-700',
  lab_tech: 'bg-coral-50 text-orange-700',
  patient: 'bg-blue-50 text-blue-600',
};

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const navItems = [...(NAV.common || []), ...(NAV[user?.role] || [])];

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate('/login');
    toast.success('Logged out.');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ──────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-brand-400 rounded-xl flex items-center justify-center">
            <span className="text-white text-xs font-bold">H</span>
          </div>
          <span className="font-display font-bold text-gray-900 text-lg">MediCore</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-100 p-3">
          <NavLink to="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center
                            text-brand-600 text-sm font-semibold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <span className={`badge text-[10px] ${ROLE_COLORS[user?.role] || ''}`}>
                {user?.role}
              </span>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            className="mt-1 w-full text-left px-2 py-1.5 rounded-lg text-xs text-gray-500
                       hover:bg-red-50 hover:text-red-600 transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
