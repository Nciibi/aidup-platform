// ─── TopBar ─────────────────────────────────────────────────────────────────
// Top navigation bar with logo, QR code button, dark mode toggle, and profile avatar
// Role-aware logo navigation

import { useAuthStore } from '../../stores/auth.store';
import { Heart, Sun, Moon, QrCode, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';

export default function TopBar() {
  const { isDarkMode, toggleDarkMode, userName, userRole } = useAuthStore();
  const navigate = useNavigate();
  const isOrganizer = userRole?.toLowerCase() === 'organizer';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-gray-950/90 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo — navigates to role-appropriate home */}
        <button
          onClick={() => navigate(isOrganizer ? '/dashboard' : '/home')}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
          </div>
          <span className="text-xl font-extrabold text-orange-500">AidUp</span>
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* QR Scanner */}
          <button
            onClick={() => navigate('/qr-login')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Scan QR"
          >
            <QrCode className="w-5 h-5 text-gray-400 hover:text-orange-500 transition-colors" />
          </button>

          {/* Dark mode toggle */}
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

          {/* Profile avatar — visible on all screens */}
          <button
            onClick={() => navigate('/profile')}
            className="ml-1 p-0.5 rounded-full hover:ring-2 hover:ring-orange-500/50 transition-all"
            title="Profile"
          >
            {userName ? (
              <Avatar alt={userName} size="w-8 h-8" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
