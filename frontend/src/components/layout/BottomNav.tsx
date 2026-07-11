import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, User, LayoutDashboard, PlusCircle, Activity } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

export default function BottomNav() {
  const userRole = useAuthStore((s) => s.userRole)?.toLowerCase();
  const isOrganizer = userRole === 'organizer';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 px-3 py-2 text-xs font-bold tracking-wider transition-colors ${
      isActive ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 md:hidden">
      <div className="flex items-center justify-around py-1 px-2 safe-area-pb">
        {isOrganizer ? (
          <>
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard className="w-5 h-5" />
              <span>DASHBOARD</span>
            </NavLink>
            <NavLink to="/create" className={linkClass}>
              <PlusCircle className="w-5 h-5" />
              <span>CREATE</span>
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              <User className="w-5 h-5" />
              <span>PROFILE</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/home" className={linkClass}>
              <Home className="w-5 h-5" />
              <span>HOME</span>
            </NavLink>
            <NavLink to="/search" className={linkClass}>
              <Search className="w-5 h-5" />
              <span>SEARCH</span>
            </NavLink>
            <NavLink to="/campaigns" className={linkClass}>
              <span className="material-symbols-outlined text-xl mb-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
              <span>CAMPAIGNS</span>
            </NavLink>
            <NavLink to="/activity" className={linkClass}>
              <Activity className="w-5 h-5" />
              <span>ACTIVITY</span>
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              <User className="w-5 h-5" />
              <span>PROFILE</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
