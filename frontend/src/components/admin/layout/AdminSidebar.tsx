import { NavLink } from 'react-router-dom';
import {
  Users, Building2, LayoutDashboard, Flag,
  Shield, DollarSign, Activity, LogOut, Sun, Moon, X
} from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../ui/Avatar';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ mobile, onClose }: SidebarProps) {
  const { userName, isDarkMode, toggleDarkMode } = useAuthStore();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const doLogout = async () => {
    await handleLogout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
      isActive
        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 shadow-sm'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300'
    }`;

  const adminLinks = [
    { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview' },
    { to: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
    { to: '/admin/organizers', icon: <Building2 className="w-5 h-5" />, label: 'Organizers' },
    { to: '/admin/campaigns', icon: <Flag className="w-5 h-5" />, label: 'Campaigns' },
    { to: '/admin/verifications', icon: <Shield className="w-5 h-5" />, label: 'Verifications' },
    { to: '/admin/donations', icon: <DollarSign className="w-5 h-5" />, label: 'Donations' },
    { to: '/admin/audit-logs', icon: <Activity className="w-5 h-5" />, label: 'Audit Logs' },
  ];

  const handleNavClick = () => {
    if (mobile && onClose) onClose();
  };

  return (
    <aside className={`${mobile ? 'flex' : 'hidden md:flex'} flex-col w-64 h-screen ${mobile ? '' : 'sticky top-0'} border-r border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl`}>
      {/* Logo and Theme Toggle */}
      <div className="px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => { navigate('/admin'); handleNavClick(); }}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-extrabold text-purple-600 tracking-tight">Admin</span>
        </button>
        <div className="flex items-center gap-1">
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
          {mobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 mt-2">
        <p className="px-4 text-[10px] font-extrabold tracking-[0.2em] text-gray-400 dark:text-gray-600 uppercase mb-3">
          Management
        </p>
        {adminLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/admin'} onClick={handleNavClick}>
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile Card */}
      <div className="px-4 pb-6">
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="flex items-center gap-3">
            <Avatar alt={userName || 'Admin'} size="w-10 h-10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {userName || 'Admin User'}
              </p>
              <p className="text-xs text-purple-500 dark:text-purple-400 truncate font-semibold">
                Super Admin
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
