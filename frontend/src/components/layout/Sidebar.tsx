// ─── Sidebar ─────────────────────────────────────────────────────────────────
// Desktop sidebar navigation — hidden on mobile (BottomNav takes over)
// Role-aware: shows different links for donator vs organizer

import { NavLink } from 'react-router-dom';
import {
  Home, Search, Heart, User, LayoutDashboard, PlusCircle,
  Shield, Settings, LogOut, Activity, Sun, Moon
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';

export default function Sidebar() {
  const { userName, userRole, userEmail, isDarkMode, toggleDarkMode } = useAuthStore();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const isOrganizer = userRole?.toLowerCase() === 'organizer';

  const doLogout = async () => {
    await handleLogout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
      isActive
        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 shadow-sm'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300'
    }`;

  const donatorLinks = [
    { to: '/home', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { to: '/search', icon: <Search className="w-5 h-5" />, label: 'Search' },
    { to: '/campaigns', icon: <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>, label: 'Campaigns' },
    { to: '/activity', icon: <Activity className="w-5 h-5" />, label: 'Activity' },
    { to: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  ];

  const organizerLinks = [
    { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/create', icon: <PlusCircle className="w-5 h-5" />, label: 'Create' },
    { to: '/verification', icon: <Shield className="w-5 h-5" />, label: 'Verification' },
    { to: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  ];

  const links = isOrganizer ? organizerLinks : donatorLinks;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
      {/* Logo and Theme Toggle */}
      <div className="px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => navigate(isOrganizer ? '/dashboard' : '/home')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
          </div>
          <span className="text-xl font-extrabold text-orange-500 tracking-tight">AidUp</span>
        </button>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isDarkMode ? 'Light mode' : 'Dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-gray-400 hover:text-yellow-400 transition-colors" />
          ) : (
            <Moon className="w-5 h-5 text-gray-400 hover:text-indigo-400 transition-colors" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 mt-2">
        <p className="px-4 text-[10px] font-extrabold tracking-[0.2em] text-gray-400 dark:text-gray-600 uppercase mb-3">
          {isOrganizer ? 'Organization' : 'Navigation'}
        </p>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass}>
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}

        <div className="pt-6">
          <p className="px-4 text-[10px] font-extrabold tracking-[0.2em] text-gray-400 dark:text-gray-600 uppercase mb-3">
            Settings
          </p>
          <NavLink to="/profile/edit" className={linkClass}>
            <Settings className="w-5 h-5" />
            <span>Edit Profile</span>
          </NavLink>
        </div>
      </nav>

      {/* User Profile Card */}
      <div className="px-4 pb-6">
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="flex items-center gap-3">
            <Avatar alt={userName || 'User'} size="w-10 h-10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {userName || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userEmail || userRole || 'Member'}
              </p>
            </div>
          </div>
          <button
            onClick={doLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
