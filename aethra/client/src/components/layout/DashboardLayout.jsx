import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FolderHeart,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Mic2,
  Settings as SettingsIcon,
  Sparkles,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import AIOrb from '../three/AIOrb';
import Brand from '../Brand';

const NAV = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/chat', label: 'AI Chat', icon: MessageSquareText },
  { to: '/app/images', label: 'Image Studio', icon: ImageIcon },
  { to: '/app/voice', label: 'Voice Assistant', icon: Mic2 },
  { to: '/app/creations', label: 'My Creations', icon: FolderHeart },
  { to: '/app/history', label: 'History', icon: History },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const initials = user?.firstName?.[0] + (user?.lastName?.[0] || '');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="nx-app">
      <div className="nx-backdrop" aria-hidden="true">
        <div className="nx-backdrop__grid" />
        <div className="nx-backdrop__orb nx-backdrop__orb--one" />
        <div className="nx-backdrop__stars" />
      </div>

      <aside className={`nx-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="nx-sidebar__brand"><Brand compact /></div>

        <div className="nx-sidebar__orb"><AIOrb state="idle" compact /></div>

        <nav className="nx-sidebar__nav" aria-label="Dashboard navigation">
          <span className="nx-sidebar__label">Workspace</span>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nx-sidebar__link ${isActive ? 'is-active' : ''}`}>
              <Icon size={18} /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="nx-sidebar__footer">
          <div className="nx-sidebar__upgrade nx-glass">
            <Sparkles size={17} />
            <div><strong>Unlimited curiosity</strong><small>One universe, endless ideas.</small></div>
          </div>
          <button className="nx-sidebar__logout" onClick={handleLogout}><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            className="nx-app__scrim"
            aria-label="Close navigation"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="nx-app__main">
        <header className="nx-topbar">
          <button className="nx-btn nx-btn--icon nx-topbar__menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu size={19} />
          </button>

          <div className="nx-topbar__title">
            <span className="nx-mono">AETHRA / WORKSPACE</span>
            <strong>{NAV.find((item) => item.to === location.pathname)?.label || 'Overview'}</strong>
          </div>

          <div className="nx-topbar__right">
            <span className="nx-topbar__status"><span className="nx-dot" /> Systems online</span>
            <div className="nx-topbar__user">
              <button className="nx-topbar__avatar" onClick={() => setMenuOpen(!menuOpen)} aria-label="Account menu" aria-expanded={menuOpen}>
                {initials || 'AE'}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div className="nx-topbar__menu nx-glass" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <div><strong>{user?.fullName}</strong><small>{user?.email}</small></div>
                    <NavLink to="/app/settings"><SettingsIcon size={15} /> Settings</NavLink>
                    <button onClick={handleLogout}><LogOut size={15} /> Sign out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="nx-app__content"><Outlet /></main>
      </div>
    </div>
  );
}
