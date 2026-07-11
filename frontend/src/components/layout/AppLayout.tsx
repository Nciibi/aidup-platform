// ─── AppLayout ──────────────────────────────────────────────────────────────
// Root layout with TopBar (mobile), Sidebar (desktop), BottomNav (mobile)
// Hides chrome on auth/onboarding pages

import { Outlet, useLocation, useNavigationType, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

const NO_CHROME_ROUTES = ['/', '/login', '/register', '/verify-email', '/admin/login'];

export default function AppLayout() {
  const location = useLocation();
  const navType = useNavigationType();
  const currentOutlet = useOutlet();
  const showChrome = !NO_CHROME_ROUTES.includes(location.pathname);

  // Determine slide direction based on navigation type (POP = back button)
  const isBack = navType === 'POP';

  const variants = {
    initial: (isBack: boolean) => ({
      x: isBack ? '-100%' : '100%',
    }),
    animate: {
      x: 0,
    },
    exit: (isBack: boolean) => ({
      x: isBack ? '100%' : '-100%',
    }),
  };

  return (
    <div className={`min-h-screen ${location.pathname === '/' ? 'bg-black' : 'bg-white dark:bg-gray-950'} text-gray-900 dark:text-gray-100 transition-colors`}>
      {showChrome ? (
        <div className="flex">
          {/* Desktop Sidebar — hidden on mobile */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-screen md:min-w-0">
            {/* TopBar — visible on mobile only when sidebar is hidden */}
            <div className="md:hidden">
              <TopBar />
            </div>

            <main className="flex-1 pb-20 md:pb-4">
              <Outlet />
            </main>

            {/* BottomNav — mobile only */}
            <BottomNav />
          </div>
        </div>
      ) : (
        <main className="relative w-full min-h-screen bg-black">
          <AnimatePresence>
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                exit: { opacity: 1, transition: { duration: 0.8 } }
              }}
              className={`absolute inset-0 w-full h-full ${location.pathname === '/' ? 'z-10' : 'z-20'}`}
            >
              {currentOutlet}
            </motion.div>
          </AnimatePresence>
        </main>
      )}
    </div>
  );
}
