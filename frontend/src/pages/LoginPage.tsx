import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import Spinner from '../components/ui/Spinner';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('donator');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const result = await login({ email, password, role: selectedRole });
    if (result.success) {
      navigate(result.role === 'organizer' ? '/dashboard' : '/home');
    }
  };

  return (
    <div className="min-h-screen relative bg-transparent font-['Inter'] overflow-hidden z-20">
      {/* Left Pane - Image & Branding (Hidden on mobile) */}
      <motion.div 
        variants={{
          initial: { width: '100vw' },
          animate: { width: '50vw', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
          exit: { width: '100vw', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
        }}
        className="hidden lg:block absolute left-0 top-0 h-full bg-black overflow-hidden z-20 shadow-2xl"
      >
        <motion.div 
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.3 } },
            exit: { opacity: 0, transition: { duration: 0.2 } }
          }}
          className="relative w-full h-full flex flex-col justify-between p-16 z-20"
        >
          <Link to="/" className="flex items-center gap-3 group w-max">
            <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
            </div>
            <span className="text-3xl font-extrabold tracking-tighter text-white whitespace-nowrap">
              Aid<span className="text-orange-500">Up</span>
            </span>
          </Link>

          <div>
            <h2 className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight whitespace-nowrap">
              Giving, with <br />
              <span className="text-orange-500">Radical Clarity.</span>
            </h2>
            <p className="text-xl text-white/60 font-medium leading-relaxed max-w-lg min-w-[300px]">
              Sign in to track your impact, explore verified causes, and witness the power of transparent giving.
            </p>
          </div>

          <div className="flex items-center gap-4 text-white/40 text-sm font-medium whitespace-nowrap">
            <span>© 2026 AidUp Foundation</span>
            <span>•</span>
            <span>Open Ledger Protocol</span>
          </div>
        </motion.div>

        {/* Background elements (Exactly matching Hero.tsx) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-600/10 via-transparent to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
          <img 
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" 
            alt="Humanitarian Aid"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        </div>
      </motion.div>

      {/* Right Pane - Form */}
      <motion.div 
        variants={{
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 } },
          exit: { x: '100%', opacity: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
        }}
        className="absolute right-0 top-0 w-full lg:w-[50vw] h-full flex items-center justify-center p-8 sm:p-12 z-10 overflow-y-auto bg-white dark:bg-gray-950"
      >
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">Welcome Back</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Sign in to your AidUp account.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800/50 mb-8 border border-gray-200 dark:border-gray-800">
            {['donator', 'organizer'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedRole === role
                    ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-md border border-gray-200 dark:border-gray-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent'
                }`}
              >
                {role === 'donator' ? '💝 Donator' : '🏢 Organizer'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold flex items-start gap-3">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all hover:bg-white dark:hover:bg-gray-800"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                <a href="#" className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all hover:bg-white dark:hover:bg-gray-800"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg shadow-xl shadow-orange-600/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <Spinner className="py-0 w-6 h-6" /> : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">Or Continue With</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="flex justify-center [&>div]:w-full">
            <GoogleLogin
              onSuccess={(response) => {
                if (response.credential) {
                  googleLogin(response.credential, selectedRole).then((result) => {
                    if (result.success) navigate(result.role === 'organizer' ? '/dashboard' : '/home');
                  });
                }
              }}
              onError={() => {}}
              theme="filled_black"
              size="large"
              text="signin_with"
              shape="pill"
            />
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-600 dark:text-orange-500 font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
